'use client';
import { useEffect, useState } from 'react';
import { Text, Badge, Stack, Group, Box, Divider, Loader, Center, Select, TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { supabase } from '@/lib/supabase';

export default function OrdersList() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchOrders();
    const channel = supabase
      .channel('orders-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchOrders)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchOrders = async () => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const { data } = await supabase.from('orders').select('*')
      .gte('created_at', today.toISOString()).order('created_at', { ascending: false });
    if (data) setOrders(data);
    setLoading(false);
  };

  const filtered = orders.filter(o => {
    const matchesFilter = filter === 'all' || o.status === filter;
    const matchesSearch = search === '' ||
      o.user_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.user_uid?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const statusColor: Record<string, string> = {
    pending: 'yellow', paid: 'green', collected: 'gray', cancelled: 'red',
  };

  const glassStyle = {
    background: 'rgba(255,255,255,0.03)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 20,
    padding: '20px',
  };

  const inputStyles = {
    input: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: 12 },
  };

  if (loading) return <Center py="xl"><Loader color="blue" /></Center>;

  return (
    <Stack gap="md">
      <Group>
        <TextInput
          placeholder="Search by name or ID..."
          leftSection={<IconSearch size={16} />}
          value={search} onChange={e => setSearch(e.target.value)}
          radius="md" style={{ flex: 1 }} styles={inputStyles}
        />
        <Select
          value={filter} onChange={v => setFilter(v ?? 'all')}
          data={[
            { value: 'all', label: 'All Orders' },
            { value: 'paid', label: '✅ Paid' },
            { value: 'collected', label: '📦 Collected' },
            { value: 'pending', label: '⏳ Pending' },
          ]}
          radius="md" w={160} styles={inputStyles}
        />
      </Group>

      {filtered.length === 0 ? (
        <Center py="xl">
          <Stack align="center" gap="xs">
            <Text size="48px" style={{ lineHeight: 1 }}>🛒</Text>
            <Text c="dimmed" fw={600} mt="xs">No orders found</Text>
          </Stack>
        </Center>
      ) : (
        filtered.map(order => (
          <Box key={order.id} style={glassStyle}>
            <Group justify="space-between" mb="sm" wrap="wrap" gap="xs">
              <Box>
                <Text fw={800} size="md" c="white">{order.user_name}</Text>
                <Text size="xs" c="dimmed" mt={2}>🎓 {order.user_uid}</Text>
              </Box>
              <Stack gap={4} align="flex-end">
                <Badge color={statusColor[order.status ?? 'pending'] ?? 'gray'} variant="light" radius="md" size="md"
                  style={{ background: 'rgba(255,255,255,0.05)', border: 'none' }}
                >
                  {(order.status ?? 'pending').toUpperCase()}
                </Badge>
                <Text size="xs" c="dimmed">
                  {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </Stack>
            </Group>

            <Divider color="rgba(255,255,255,0.06)" mb="sm" />

            <Stack gap={6}>
              {order.items.map((item: any, i: number) => (
                <Group key={i} justify="space-between">
                  <Text size="sm" c="rgba(255,255,255,0.7)">{item.emoji} {item.name} × {item.qty}</Text>
                  <Text size="sm" fw={600} c="blue">₹{item.price * item.qty}</Text>
                </Group>
              ))}
            </Stack>

            <Divider color="rgba(255,255,255,0.06)" my="sm" />

            <Group justify="space-between">
              <Text size="sm" c="dimmed">Total Paid</Text>
              <Text fw={800} c="blue">₹{order.grand_total}</Text>
            </Group>
          </Box>
        ))
      )}
    </Stack>
  );
}