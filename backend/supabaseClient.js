const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://mrlimtahgmohbleuvspt.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ybGltdGFoZ21vaGJsZXV2c3B0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjI2NTIyNzIsImV4cCI6MjAzODIyODI3Mn0.2GVQV4MpqhAbS7oB0mrzrDQE5vMOWDs6HWF9jnVQv2Y';

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
