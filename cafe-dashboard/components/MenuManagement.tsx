'use client';
import { useEffect, useState } from 'react';
import {
  Text, Stack, Group, Box, Button, Badge,
  TextInput, NumberInput, Select, Switch, Modal,
  Loader, Center, ActionIcon, Divider, Textarea,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconEdit, IconPlus, IconSearch,
  IconPackage, IconEye, IconEyeOff,
} from '@tabler/icons-react';
import { supabase } from '@/lib/supabase';

type MenuItem = {
  id: number;
  name: string;
  price: number;
  emoji: string;
  description: string;
  category: string;
  tag: string;
  stock: number;
  is_available: boolean;
};

const CATEGORIES = [
  'Rice & Biryani',
  'Burgers & Sandwiches',
  'Pizza',
  'Healthy',
  'Drinks & Desserts',
];

const TAGS = ['', 'Bestseller', 'Popular', 'Healthy', 'Spicy'];

const emptyItem: Omit<MenuItem, 'id'> = {
  name: '', price: 0, emoji: '🍽️', description: '',
  category: 'Rice & Biryani', tag: '', stock: -1, is_available: true,
};

const glassStyle = {
  background: 'rgba(255,255,255,0.03)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 20,
  padding: '20px',
};

const inputStyles = {
  input: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: 'white',
    borderRadius: 12,
  },
  label: { color: 'rgba(255,255,255,0.7)', marginBottom: 6 },
};

export default function MenuManagement() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [form, setForm] = useState<Omit<MenuItem, 'id'>>(emptyItem);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchItems();
    const channel = supabase
      .channel('menu-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items' }, fetchItems)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchItems = async () => {
    const { data } = await supabase
      .from('menu_items')
      .select('*')
      .order('category')
      .order('name');
    if (data) setItems(data);
    setLoading(false);
  };

  const openAdd = () => {
    setEditItem(null);
    setForm(emptyItem);
    setModalOpen(true);
  };

  const openEdit = (item: MenuItem) => {
    setEditItem(item);
    setForm({
      name: item.name, price: item.price, emoji: item.emoji,
      description: item.description, category: item.category,
      tag: item.tag, stock: item.stock, is_available: item.is_available,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price) {
      notifications.show({ title: 'Error', message: 'Name and price are required', color: 'red' });
      return;
    }
    setSaving(true);

    if (editItem) {
      const { error } = await supabase
        .from('menu_items')
        .update({ ...form, updated_at: new Date().toISOString() })
        .eq('id', editItem.id);

      if (error) {
        notifications.show({ title: 'Error', message: error.message, color: 'red' });
      } else {
        setItems(prev => prev.map(i => i.id === editItem.id ? { ...i, ...form } : i));
        notifications.show({ title: '✅ Updated', message: `${form.name} updated successfully`, color: 'green' });
        setModalOpen(false);
      }
    } else {
      const { data, error } = await supabase
        .from('menu_items')
        .insert(form)
        .select()
        .single();

      if (error) {
        notifications.show({ title: 'Error', message: error.message, color: 'red' });
      } else {
        setItems(prev => [...prev, data]);
        notifications.show({ title: '✅ Added', message: `${form.name} added to menu`, color: 'green' });
        setModalOpen(false);
      }
    }
    setSaving(false);
  };

  const toggleAvailability = async (item: MenuItem) => {
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_available: !i.is_available } : i));
    const { error } = await supabase
      .from('menu_items')
      .update({ is_available: !item.is_available, updated_at: new Date().toISOString() })
      .eq('id', item.id);

    if (error) {
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_available: item.is_available } : i));
      notifications.show({ title: 'Error', message: error.message, color: 'red' });
    } else {
      notifications.show({
        title: item.is_available ? '🔴 Marked Unavailable' : '🟢 Marked Available',
        message: `${item.name} is now ${item.is_available ? 'unavailable' : 'available'}`,
        color: item.is_available ? 'red' : 'green',
      });
    }
  };

  const updateStock = async (item: MenuItem, newStock: number) => {
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, stock: newStock } : i));
    const { error } = await supabase
      .from('menu_items')
      .update({ stock: newStock, updated_at: new Date().toISOString() })
      .eq('id', item.id);

    if (error) {
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, stock: item.stock } : i));
      notifications.show({ title: 'Error', message: error.message, color: 'red' });
    }
  };

  const filtered = items.filter(i => {
    const matchesSearch = search === '' || i.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === 'all' || i.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getStockBadge = (item: MenuItem) => {
    if (!item.is_available) return <Badge color="red" variant="light" size="sm" style={{ background: 'rgba(255,80,80,0.1)', border: 'none' }}>Unavailable</Badge>;
    if (item.stock === -1) return <Badge color="green" variant="light" size="sm" style={{ background: 'rgba(16,185,129,0.1)', border: 'none' }}>Unlimited</Badge>;
    if (item.stock === 0) return <Badge color="red" variant="light" size="sm" style={{ background: 'rgba(255,80,80,0.1)', border: 'none' }}>Sold Out</Badge>;
    if (item.stock <= 5) return <Badge color="orange" variant="light" size="sm" style={{ background: 'rgba(245,158,11,0.1)', border: 'none' }}>Low: {item.stock} left</Badge>;
    return <Badge color="green" variant="light" size="sm" style={{ background: 'rgba(16,185,129,0.1)', border: 'none' }}>{item.stock} in stock</Badge>;
  };

  if (loading) return <Center py="xl"><Loader color="blue" /></Center>;

  return (
    <>
      <Stack gap="md">
        <Group justify="space-between">
          <Text fw={800} size="lg" c="white">Menu Items <Text span c="dimmed" fw={400}>({items.length})</Text></Text>
          <Button
            leftSection={<IconPlus size={16} />}
            radius="md"
            onClick={openAdd}
            style={{
              background: 'linear-gradient(135deg, #007AFF, #0055CC)',
              boxShadow: '0 4px 12px rgba(0,122,255,0.3)',
            }}
          >
            Add Item
          </Button>
        </Group>

        <Group>
          <TextInput
            placeholder="Search items..."
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={e => setSearch(e.target.value)}
            radius="md"
            style={{ flex: 1 }}
            styles={inputStyles}
          />
          <Select
            value={filterCategory}
            onChange={v => setFilterCategory(v ?? 'all')}
            data={[
              { value: 'all', label: 'All Categories' },
              ...CATEGORIES.map(c => ({ value: c, label: c })),
            ]}
            radius="md"
            w={200}
            styles={inputStyles}
          />
        </Group>

        {filtered.length === 0 ? (
          <Center py="xl">
            <Stack align="center" gap="xs">
              <Text size="48px" style={{ lineHeight: 1 }}>🍽️</Text>
              <Text c="dimmed" fw={600} mt="xs">No items found</Text>
            </Stack>
          </Center>
        ) : (
          filtered.map(item => (
            <Box
              key={item.id}
              style={{ ...glassStyle, opacity: item.is_available ? 1 : 0.6 }}
            >
              <Group justify="space-between" align="flex-start">
                <Group gap="md" align="flex-start">
                  <Text size="36px" style={{ lineHeight: 1 }}>{item.emoji}</Text>
                  <Box>
                    <Group gap="xs" mb={4}>
                      <Text fw={800} size="md" c="white">{item.name}</Text>
                      {item.tag && (
                        <Badge color="blue" variant="light" size="xs"
                          style={{ background: 'rgba(0,122,255,0.1)', border: 'none' }}
                        >
                          {item.tag}
                        </Badge>
                      )}
                    </Group>
                    <Text size="xs" c="dimmed" mb={6}>{item.description}</Text>
                    <Group gap="xs">
                      <Badge color="blue" variant="light" size="sm" style={{ background: 'rgba(0,122,255,0.1)', border: 'none' }}>₹{item.price}</Badge>
                      <Badge color="violet" variant="light" size="sm" style={{ background: 'rgba(139,92,246,0.1)', border: 'none' }}>{item.category}</Badge>
                      {getStockBadge(item)}
                    </Group>
                  </Box>
                </Group>

                <Group gap="xs">
                  <ActionIcon
                    variant="light"
                    color={item.is_available ? 'red' : 'green'}
                    radius="md"
                    size="lg"
                    onClick={() => toggleAvailability(item)}
                    title={item.is_available ? 'Mark unavailable' : 'Mark available'}
                    style={{
                      background: item.is_available ? 'rgba(255,80,80,0.1)' : 'rgba(16,185,129,0.1)',
                      border: 'none',
                    }}
                  >
                    {item.is_available ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                  </ActionIcon>
                  <ActionIcon
                    variant="light"
                    color="blue"
                    radius="md"
                    size="lg"
                    onClick={() => openEdit(item)}
                    style={{ background: 'rgba(0,122,255,0.1)', border: 'none' }}
                  >
                    <IconEdit size={16} />
                  </ActionIcon>
                </Group>
              </Group>

              {item.stock !== -1 && (
                <>
                  <Divider color="rgba(255,255,255,0.06)" my="sm" />
                  <Group gap="sm" align="center">
                    <IconPackage size={16} color="#555" />
                    <Text size="sm" c="dimmed">Stock:</Text>
                    <Group gap="xs">
                      <ActionIcon
                        variant="light" color="red" size="sm" radius="md"
                        onClick={() => updateStock(item, Math.max(0, item.stock - 1))}
                        disabled={item.stock <= 0}
                        style={{ background: 'rgba(255,80,80,0.1)', border: 'none' }}
                      >
                        −
                      </ActionIcon>
                      <Text fw={700} size="sm" c="white" w={30} ta="center">{item.stock}</Text>
                      <ActionIcon
                        variant="light" color="green" size="sm" radius="md"
                        onClick={() => updateStock(item, item.stock + 1)}
                        style={{ background: 'rgba(16,185,129,0.1)', border: 'none' }}
                      >
                        +
                      </ActionIcon>
                    </Group>
                  </Group>
                </>
              )}
            </Box>
          ))
        )}
      </Stack>

      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={<Text fw={800} c="white">{editItem ? '✏️ Edit Item' : '➕ Add New Item'}</Text>}
        radius="xl"
        size="md"
        styles={{
          content: {
            backgroundColor: '#0d1117',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(20px)',
          },
          header: { backgroundColor: '#0d1117' },
        }}
      >
        <Stack gap="md">
          <Group grow>
            <TextInput
              label="Emoji"
              value={form.emoji}
              onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))}
              radius="md"
              maxLength={2}
              styles={inputStyles}
            />
            <TextInput
              label="Item Name"
              placeholder="e.g. Chicken Biryani"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              radius="md"
              styles={inputStyles}
            />
          </Group>

          <Textarea
            label="Description"
            placeholder="Short description..."
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            radius="md"
            rows={2}
            styles={inputStyles}
          />

          <Group grow>
            <NumberInput
              label="Price (₹)"
              value={form.price}
              onChange={v => setForm(f => ({ ...f, price: Number(v) }))}
              min={0}
              radius="md"
              prefix="₹"
              styles={inputStyles}
            />
            <NumberInput
              label="Stock (-1 = unlimited)"
              value={form.stock}
              onChange={v => setForm(f => ({ ...f, stock: Number(v) }))}
              min={-1}
              radius="md"
              styles={inputStyles}
            />
          </Group>

          <Select
            label="Category"
            value={form.category}
            onChange={v => setForm(f => ({ ...f, category: v ?? 'Rice & Biryani' }))}
            data={CATEGORIES.map(c => ({ value: c, label: c }))}
            radius="md"
            styles={inputStyles}
          />

          <Select
            label="Tag"
            value={form.tag}
            onChange={v => setForm(f => ({ ...f, tag: v ?? '' }))}
            data={TAGS.map(t => ({ value: t, label: t || 'None' }))}
            radius="md"
            styles={inputStyles}
          />

          <Switch
            label="Available for ordering"
            checked={form.is_available}
            onChange={e => setForm(f => ({ ...f, is_available: e.currentTarget.checked }))}
            color="blue"
            styles={{ label: { color: 'rgba(255,255,255,0.7)' } }}
          />

          <Button
            fullWidth radius="md" loading={saving} onClick={handleSave} mt="xs"
            style={{
              background: 'linear-gradient(135deg, #007AFF, #0055CC)',
              boxShadow: '0 4px 12px rgba(0,122,255,0.3)',
            }}
          >
            {editItem ? 'Save Changes' : 'Add to Menu'}
          </Button>
        </Stack>
      </Modal>
    </>
  );
}