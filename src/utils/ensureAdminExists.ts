
import { supabase } from '@/integrations/supabase/client';

export const ensureMainAdminExists = async (): Promise<void> => {
  const mainAdminEmail = 'aijim.official@gmail.com';

  try {
    // Check if admin already exists
    const { data: existingAdmin, error: checkError } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', mainAdminEmail)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking admin existence:', checkError);
      return;
    }

    if (existingAdmin) {

      return;
    }

    // Insert the admin user
    const { error: insertError } = await supabase
      .from('admin_users')
      .insert({
        email: mainAdminEmail,
        role: 'super_admin',
        permissions: ['products.all', 'orders.all', 'users.all'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error('Error creating admin user:', insertError);
    } else {
      console.log('Admin user created successfully');
    }
  } catch (error) {
    console.error('Error in ensureMainAdminExists:', error);
  }
};
