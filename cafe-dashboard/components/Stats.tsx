'use client';
import { useEffect, useState } from 'react';
import { Text, Stack, Group, Box, Loader, Center, RingProgress, SimpleGrid } from '@mantine/core';
import { IconCurrencyRupee, IconShoppingCart, IconCheck, IconClock } from '@tabler/icons-react';
import { supabase } from '@/lib/supabase';

export default function Stats() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [topItems, setTopItems] = useState<{ name: string; emoji: string; qty: number }[]>([]);

  useEffect(() => {
    fetchStats();
    const channel = supabase.channel('stats-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchStats)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchStats = async () => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const { data } = await supabase.from('orders').select('*').gte('created_at', today.toISOString());
    if (data) {
      setOrders(data);
      const itemMap: Record<string, { name: string; emoji: string; qty: number }> = {};
      data.forEach(order => {
        order.items.forEach((item: any) => {
          if (itemMap[item.name]) itemMap[item.name].qty += item.qty;
          else itemMap[item.name] = { name: item.name, emoji: item.emoji, qty: item.qty };
        });
      });
      setTopItems(Object.values(itemMap).sort((a, b) => b.qty - a.qty).slice(0, 5));
    }
    setLoading(false);
  };

  if (loading) return <Center py="xl"><Loader color="blue" /></Center>;

  const totalOrders = orders.length;
  const collectedOrders = orders.filter(o => o.status === 'collected').length;
  const pendingOrders = orders.filter(o => o.status === 'paid').length;
  const totalRevenue = orders.filter(o => o.status !== 'pending').reduce((s, o) => s + o.grand_total, 0);
  const collectionRate = totalOrders > 0 ? Math.round((collectedOrders / totalOrders) * 100) : 0;

  const glassStyle = {
    background: 'rgba(255,255,255,0.03)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 20,
    padding: '20px',
  };

  const statCards = [
    { label: "Revenue",   value: `₹${totalRevenue}`, icon: <IconCurrencyRupee size={18} />, color: '#007AFF', bg: 'rgba(0,122,255,0.1)' },
    { label: "Orders",    value: totalOrders,          icon: <IconShoppingCart size={18} />,  color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
    { label: "Collected", value: collectedOrders,      icon: <IconCheck size={18} />,         color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
    { label: "Pending",   value: pendingOrders,        icon: <IconClock size={18} />,         color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  ];

  return (
    <Stack gap="lg">
      <SimpleGrid cols={2} spacing="md">
        {statCards.map((card, i) => (
          <Box key={i} style={glassStyle}>
            <Group gap="sm" mb="sm">
              <Box style={{
                width: 36, height: 36, borderRadius: 10,
                background: card.bg, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                color: card.color,
              }}>
                {card.icon}
              </Box>
              <Text size="xs" c="dimmed" fw={600} tt="uppercase" style={{ letterSpacing: 0.5 }}>
                {card.label}
              </Text>
            </Group>
            <Text fw={900} size="28px" c="white" style={{ letterSpacing: '-1px' }}>{card.value}</Text>
          </Box>
        ))}
      </SimpleGrid>

      <Box style={glassStyle}>
        <Group justify="space-between" align="center">
          <Box>
            <Text fw={700} size="md" c="white" mb={4}>Collection Rate</Text>
            <Text c="dimmed" size="sm">{collectedOrders} of {totalOrders} orders collected</Text>
          </Box>
          <RingProgress size={90} thickness={8} roundCaps
            sections={[{ value: collectionRate, color: 'blue' }]}
            label={<Text fw={800} size="sm" ta="center" c="white">{collectionRate}%</Text>}
          />
        </Group>
      </Box>

      {topItems.length > 0 && (
        <Box style={glassStyle}>
          <Text fw={700} size="md" c="white" mb="md">🏆 Top Items Today</Text>
          <Stack gap="sm">
            {topItems.map((item, i) => (
              <Group key={i} justify="space-between" p="sm"
                style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12 }}
              >
                <Group gap="sm">
                  <Text fw={800} c="blue" size="sm" w={24}>#{i + 1}</Text>
                  <Text size="sm" c="rgba(255,255,255,0.8)">{item.emoji} {item.name}</Text>
                </Group>
                <Text size="sm" fw={700} c="dimmed">{item.qty} sold</Text>
              </Group>
            ))}
          </Stack>
        </Box>
      )}

      {orders.length === 0 && (
        <Center py="xl">
          <Stack align="center" gap="xs">
            <Text size="48px" style={{ lineHeight: 1 }}>📊</Text>
            <Text c="dimmed" fw={600} mt="xs">No orders yet today</Text>
          </Stack>
        </Center>
      )}
    </Stack>
  );
}