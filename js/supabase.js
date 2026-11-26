
import { createClient } from
'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://jaxrzoltiqmshpcvzkah.supabase.co';

const SUPABASE_KEY = 'sb_publishable_Cb51a3y_peAQNk7YzKIT7w_dyAhqMnf';

export const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

