'use client';
import { useState } from 'react';
import { Box, Text, UnstyledButton, Group, Badge, Avatar, Tooltip } from '@mantine/core';
import {
  IconScan, IconList, IconChartBar,
  IconToolsKitchen2, IconLogout, IconLayoutDashboard,
} from '@tabler/icons-react';
import { supabase } from '@/lib/supabase';
import Scanner from '@/components/Scanner';
import OrdersList from '@/components/OrdersList';
import Stats from '@/components/Stats';
import MenuManagement from '@/components/MenuManagement';

const NAV_ITEMS = [
  { value: 'scanner', label: 'Scan QR',    icon: IconScan },
  { value: 'orders',  label: 'Orders',     icon: IconList },
  { value: 'menu',    label: 'Menu',       icon: IconToolsKitchen2 },
  { value: 'stats',   label: 'Stats',      icon: IconChartBar },
];

export default function Dashboard({ ownerName }: { ownerName: string }) {
  const [activeTab, setActiveTab] = useState('scanner');
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => { await supabase.auth.signOut(); };

  const activeItem = NAV_ITEMS.find(i => i.value === activeTab);

  return (
    <Box style={{
      display: 'flex', minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0f 0%, #0d1117 100%)',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Sidebar */}
      <Box style={{
        width: 240, flexShrink: 0,
        background: 'rgba(255,255,255,0.02)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', flexDirection: 'column',
        padding: '24px 16px',
        position: 'sticky', top: 0, height: '100vh',
      }} visibleFrom="md">
        {/* Logo */}
        <Box style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40, paddingLeft: 8 }}>
          <Box style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'linear-gradient(135deg, #007AFF, #0055CC)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, boxShadow: '0 4px 12px rgba(0,122,255,0.3)',
          }}>🍽️</Box>
          <Box>
            <Text fw={800} size="sm" c="white" style={{ letterSpacing: '-0.3px' }}>Canteen</Text>
            <Text size="xs" c="dimmed">Dashboard</Text>
          </Box>
        </Box>

        {/* Nav Items */}
        <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Text size="xs" c="dimmed" fw={700} tt="uppercase" style={{ letterSpacing: 1, paddingLeft: 12, marginBottom: 8 }}>
            Navigation
          </Text>
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.value;
            return (
              <UnstyledButton
                key={item.value}
                onClick={() => setActiveTab(item.value)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 12px', borderRadius: 12,
                  background: isActive ? 'rgba(0,122,255,0.15)' : 'transparent',
                  border: isActive ? '1px solid rgba(0,122,255,0.3)' : '1px solid transparent',
                  color: isActive ? '#007AFF' : 'rgba(255,255,255,0.5)',
                  transition: 'all 0.15s ease',
                  cursor: 'pointer',
                }}
              >
                <Icon size={18} />
                <Text size="sm" fw={isActive ? 700 : 500}>{item.label}</Text>
                {isActive && (
                  <Box style={{
                    marginLeft: 'auto', width: 6, height: 6,
                    borderRadius: '50%', background: '#007AFF',
                  }} />
                )}
              </UnstyledButton>
            );
          })}
        </Box>

        {/* User + Logout */}
        <Box style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          <Box style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 12,
            background: 'rgba(255,255,255,0.03)',
          }}>
            <Avatar
              size={32} radius="xl"
              style={{ background: 'linear-gradient(135deg, #007AFF, #0055CC)' }}
            >
              {ownerName.charAt(0).toUpperCase()}
            </Avatar>
            <Box style={{ flex: 1, minWidth: 0 }}>
              <Text size="sm" fw={700} c="white" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {ownerName}
              </Text>
              <Text size="xs" c="dimmed">Admin</Text>
            </Box>
          </Box>
          <UnstyledButton
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 12,
              color: 'rgba(255,80,80,0.8)',
              border: '1px solid transparent',
              transition: 'all 0.15s ease',
              cursor: 'pointer',
            }}
          >
            <IconLogout size={16} />
            <Text size="sm" fw={600}>Sign Out</Text>
          </UnstyledButton>
        </Box>
      </Box>

      {/* Mobile Bottom Nav */}
      <Box hiddenFrom="md" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(10,10,15,0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', padding: '8px 0',
      }}>
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.value;
          return (
            <UnstyledButton
              key={item.value}
              onClick={() => setActiveTab(item.value)}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 4, padding: '6px 0',
                color: isActive ? '#007AFF' : 'rgba(255,255,255,0.4)',
                cursor: 'pointer',
              }}
            >
              <Icon size={20} />
              <Text size="10px" fw={isActive ? 700 : 500}>{item.label}</Text>
            </UnstyledButton>
          );
        })}
      </Box>

      {/* Main Content */}
      <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Bar */}
        <Box style={{
          padding: '20px 28px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'rgba(255,255,255,0.01)',
          backdropFilter: 'blur(10px)',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <Box>
            <Text fw={800} size="xl" c="white" style={{ letterSpacing: '-0.5px' }}>
              {activeItem?.label}
            </Text>
            <Text size="xs" c="dimmed" mt={2}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </Text>
          </Box>
          <Box hiddenFrom="md">
            <Badge color="blue" variant="light" radius="md">👤 {ownerName}</Badge>
          </Box>
        </Box>

        {/* Page Content */}
        <Box style={{ flex: 1, padding: '24px 28px', paddingBottom: 80, overflowY: 'auto' }}>
          <Box style={{ maxWidth: 720, margin: '0 auto' }}>
            {activeTab === 'scanner' && <Scanner />}
            {activeTab === 'orders'  && <OrdersList />}
            {activeTab === 'menu'    && <MenuManagement />}
            {activeTab === 'stats'   && <Stats />}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}