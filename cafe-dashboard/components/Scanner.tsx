'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Text, Button, Badge, Stack, Group, Box, Divider, Loader, Center, Paper } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { supabase } from '@/lib/supabase';

type ScanStatus = 'valid' | 'used' | 'expired' | 'invalid' | 'unpaid';
type OrderResult = { status: ScanStatus; order?: any };

export default function Scanner() {
  const scannerRef = useRef<any>(null);
  const [result, setResult] = useState<OrderResult | null>(null);
  const [processing, setProcessing] = useState(false);
  const [collecting, setCollecting] = useState(false);
  const [scannerReady, setScannerReady] = useState(false);

  const getQrBoxSize = () => {
    if (typeof window === 'undefined') return 250;
    const w = window.innerWidth;
    if (w < 400) return 180;
    if (w < 600) return 220;
    return 260;
  };

  const processQR = useCallback(async (token: string) => {
    const { data: order, error } = await supabase
      .from('orders').select('*').eq('qr_token', token).single();
    if (error || !order) { setResult({ status: 'invalid' }); return; }
    if (order.qr_used) { setResult({ status: 'used', order }); return; }
    if (new Date() > new Date(order.qr_expires_at)) { setResult({ status: 'expired', order }); return; }
    if (order.status !== 'paid') { setResult({ status: 'unpaid', order }); return; }
    setResult({ status: 'valid', order });
  }, []);

  const initScanner = useCallback(async () => {
    setScannerReady(false);
    try { scannerRef.current?.clear(); } catch (e) {}
    const { Html5QrcodeScanner } = await import('html5-qrcode');
    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      { fps: 10, qrbox: { width: getQrBoxSize(), height: getQrBoxSize() } },
      false
    );
    scanner.render(async (token: string) => {
      setProcessing(true);
      try { scanner.clear(); } catch (e) {}
      setScannerReady(false);
      await processQR(token);
    }, () => {});
    scannerRef.current = scanner;
    setScannerReady(true);
  }, [processQR]);

  useEffect(() => {
    initScanner();
    return () => { try { scannerRef.current?.clear(); } catch (e) {} };
  }, []);

  const handleCollect = async () => {
    if (!result?.order) return;
    setCollecting(true);
    const { error } = await supabase
      .from('orders').update({ qr_used: true, status: 'collected' }).eq('id', result.order.id);
    if (error) {
      notifications.show({ title: 'Error', message: error.message, color: 'red' });
      setCollecting(false);
      return;
    }
    notifications.show({ title: '✅ Order Collected', message: `${result.order.user_name}'s order handed over!`, color: 'green' });
    setResult({ status: 'valid', order: { ...result.order, qr_used: true, status: 'collected' } });
    setCollecting(false);
  };

  const resetScanner = async () => {
    setResult(null);
    setProcessing(false);
    await initScanner();
  };

  const glassStyle = {
    background: 'rgba(255,255,255,0.03)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 20,
  };

  const invalidStates: Record<string, { emoji: string; title: string; color: string; msg: string }> = {
    invalid: { emoji: '❌', title: 'Invalid QR Code',      color: 'red',    msg: 'This QR code is not recognized in our system.' },
    used:    { emoji: '🚫', title: 'Already Collected',    color: 'red',    msg: 'This order has already been collected.' },
    expired: { emoji: '⏰', title: 'QR Expired',           color: 'orange', msg: 'This QR expired at midnight. Student needs to reorder.' },
    unpaid:  { emoji: '💳', title: 'Payment Not Verified', color: 'red',    msg: 'Payment for this order has not been confirmed.' },
  };

  if (result && result.status !== 'valid') {
    const s = invalidStates[result.status];
    return (
      <Box p="xl" style={{ ...glassStyle, border: `1px solid rgba(255,80,80,0.2)` }}>
        <Stack align="center" gap="md">
          <Text size="48px" style={{ lineHeight: 1 }}>{s.emoji}</Text>
          <Text fw={800} size="xl" c={s.color}>{s.title}</Text>
          <Text c="dimmed" ta="center" size="sm">{s.msg}</Text>
          <Button onClick={resetScanner} variant="light" color="gray" radius="md" fullWidth mt="sm">
            Scan Again
          </Button>
        </Stack>
      </Box>
    );
  }

  if (result?.status === 'valid') {
    const order = result.order;
    const isCollected = order.status === 'collected' || order.qr_used;
    return (
      <Box p="xl" style={{ ...glassStyle, border: `1px solid ${isCollected ? 'rgba(255,255,255,0.08)' : 'rgba(47,158,68,0.4)'}` }}>
        <Stack gap="lg">
          <Group justify="space-between" align="center" wrap="wrap" gap="xs">
            <Badge
              color={isCollected ? 'gray' : 'green'} size="lg" radius="md" variant="light"
              style={{ background: isCollected ? 'rgba(255,255,255,0.05)' : 'rgba(47,158,68,0.15)', border: 'none' }}
            >
              {isCollected ? '✅ COLLECTED' : '✅ PAYMENT VERIFIED'}
            </Badge>
            <Text size="xs" c="dimmed">
              {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </Group>

          <Box>
            <Text fw={900} size="xl" c="white">{order.user_name}</Text>
            <Text size="sm" c="dimmed" mt={2}>🎓 {order.user_uid}</Text>
          </Box>

          <Divider color="rgba(255,255,255,0.06)" />

          <Text size="xs" fw={700} c="blue" tt="uppercase" style={{ letterSpacing: 1 }}>Items Ordered</Text>

          <Stack gap="xs">
            {order.items.map((item: any, i: number) => (
              <Group key={i} justify="space-between" p="sm"
                style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12 }} wrap="nowrap"
              >
                <Box>
                  <Text fw={600} size="sm" c="white">{item.emoji} {item.name}</Text>
                  <Text size="xs" c="dimmed">Qty: {item.qty}</Text>
                </Box>
                <Text fw={700} size="sm" c="blue">₹{item.price * item.qty}</Text>
              </Group>
            ))}
          </Stack>

          <Divider color="rgba(255,255,255,0.06)" />

          <Group justify="space-between">
            <Text fw={800} size="lg" c="white">Total Paid</Text>
            <Text fw={900} size="xl" c="blue">₹{order.grand_total}</Text>
          </Group>

          {!isCollected ? (
            <Stack gap="sm">
              <Button size="lg" radius="md" color="green" loading={collecting} onClick={handleCollect} fullWidth
                style={{ background: 'linear-gradient(135deg, #2f9e44, #1e6e2e)', boxShadow: '0 4px 16px rgba(47,158,68,0.3)' }}
              >
                ✅ Mark as Collected
              </Button>
              <Button onClick={resetScanner} variant="subtle" color="gray" radius="md" fullWidth>Cancel</Button>
            </Stack>
          ) : (
            <Button onClick={resetScanner} variant="light" color="blue" radius="md" fullWidth>Scan Next Order</Button>
          )}
        </Stack>
      </Box>
    );
  }

  return (
    <Stack gap="lg">
      <Box p="lg" style={glassStyle}>
        <Text fw={700} size="md" mb="md" c="blue">📷 Scan Student QR Code</Text>
        <Box id="qr-reader" style={{ borderRadius: 12, overflow: 'hidden', width: '100%' }} />
        {!scannerReady && <Center py="xl"><Loader color="blue" /></Center>}
      </Box>
    </Stack>
  );
}