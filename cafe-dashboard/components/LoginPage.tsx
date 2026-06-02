'use client';
import { useState } from 'react';
import { Box, Center, Text, Title, TextInput, PasswordInput, Button, Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { supabase } from '@/lib/supabase';

export default function LoginPage({ onLogin }: { onLogin: (user: any) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setLoading(true);
    setError('');

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) { setError('Invalid email or password'); setLoading(false); return; }

    const { data: ownerData } = await supabase
      .from('cafe_owners').select('name').eq('id', data.user.id).single();

    if (!ownerData) {
      await supabase.auth.signOut();
      setError('Access denied. This dashboard is for canteen staff only.');
      setLoading(false);
      return;
    }

    onLogin(data.user);
    setLoading(false);
  };

  return (
    <Box style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0f 0%, #0d1117 50%, #0a0f1a 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background orbs */}
      <Box style={{
        position: 'absolute', top: '20%', left: '20%',
        width: 300, height: 300, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,122,255,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <Box style={{
        position: 'absolute', bottom: '20%', right: '20%',
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <Box style={{
        width: '100%', maxWidth: 420,
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 24,
        padding: '40px 36px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
      }}>
        <Box style={{ textAlign: 'center', marginBottom: 32 }}>
          <Box style={{
            width: 64, height: 64, borderRadius: 18,
            background: 'linear-gradient(135deg, #007AFF, #0055CC)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', fontSize: 28,
            boxShadow: '0 8px 24px rgba(0,122,255,0.3)',
          }}>🍽️</Box>
          <Title order={2} fw={800} c="white" style={{ letterSpacing: '-0.5px' }}>Canteen Dashboard</Title>
          <Text size="sm" c="dimmed" mt={6}>Staff access only</Text>
        </Box>

        {error && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md" radius="md" variant="light">
            {error}
          </Alert>
        )}

        <Box style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <TextInput
            label="Email"
            placeholder="staff@canteen.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            size="md" radius="md"
            styles={{
              input: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' },
              label: { color: 'rgba(255,255,255,0.7)', marginBottom: 6 },
            }}
          />
          <PasswordInput
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            size="md" radius="md"
            styles={{
              input: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' },
              label: { color: 'rgba(255,255,255,0.7)', marginBottom: 6 },
            }}
          />
          <Button
            fullWidth size="md" radius="md" mt={8}
            loading={loading} onClick={handleLogin}
            style={{
              background: 'linear-gradient(135deg, #007AFF, #0055CC)',
              boxShadow: '0 4px 16px rgba(0,122,255,0.3)',
            }}
          >
            Sign In
          </Button>
        </Box>

        <Text size="xs" c="dimmed" ta="center" mt="xl">
          🔒 Secured — students cannot access this dashboard
        </Text>
      </Box>
    </Box>
  );
}