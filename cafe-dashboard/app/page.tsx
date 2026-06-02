'use client';
import { useEffect, useState } from 'react';
import { Center, Loader, Box } from '@mantine/core';
import { supabase } from '@/lib/supabase';
import LoginPage from '@/components/LoginPage';
import Dashboard from '@/components/Dashboard';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [ownerName, setOwnerName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) await verifyOwner(session.user);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_e, session) => {
      if (!session) {
        setUser(null);
        setOwnerName('');
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const verifyOwner = async (authUser: any) => {
    const { data } = await supabase
      .from('cafe_owners')
      .select('name')
      .eq('id', authUser.id)
      .single();

    if (data) {
      setUser(authUser);
      setOwnerName(data.name);
    } else {
      await supabase.auth.signOut();
      setUser(null);
      setOwnerName('');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <Box style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #0d1117 100%)', minHeight: '100vh' }}>
        <Center h="100vh">
          <Loader color="blue" size="lg" />
        </Center>
      </Box>
    );
  }

  if (!user) return <LoginPage onLogin={verifyOwner} />;
  return <Dashboard ownerName={ownerName} />;
}