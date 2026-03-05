import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

// Load .env.local manually
const envFile = readFileSync('.env.local', 'utf-8')
const env = Object.fromEntries(
    envFile.split('\n')
        .filter(line => line && !line.startsWith('#'))
        .map(line => line.split('='))
        .map(([key, ...val]) => [key.trim(), val.join('=').trim()])
)

const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
)

async function seed() {
    const testEmail = 'demo@example.com'
    const testPassword = 'password123'
    const testName = 'Demo Client'

    console.log('--- SEEDING TEST DATA ---')

    // 1. Create/Get Auth User
    let authId
    const { data: users, error: listError } = await supabase.auth.admin.listUsers()
    const existingUser = users?.users.find(u => u.email === testEmail)

    if (existingUser) {
        console.log(`User ${testEmail} already exists. Using existing ID.`)
        authId = existingUser.id
    } else {
        console.log(`Creating user ${testEmail}...`)
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
            email: testEmail,
            password: testPassword,
            email_confirm: true
        })

        if (createError) {
            console.error('Error creating auth user:', createError.message)
            return
        }
        authId = newUser.user.id
    }

    // 2. Create/Update Client
    const { error: clientError } = await supabase
        .from('clients')
        .upsert({
            id: authId,
            email: testEmail,
            name: testName,
            active: true
        })

    if (clientError) {
        console.error('Error upserting client:', clientError.message)
        return
    }
    console.log('Client record created.')

    // 3. Create Project
    const { data: project, error: projectError } = await supabase
        .from('projects')
        .upsert({
            client_id: authId,
            title: 'The Axis Residence',
            location: 'Lusaka, Zambia',
            status: 'in_progress',
            description: 'A contemporary luxury residence featuring Quinsi-inspired architectural elements and modern minimalist interiors.'
        }, { onConflict: 'client_id' })
        .select()
        .single()

    if (projectError) {
        console.error('Error upserting project:', projectError.message)
        return
    }
    console.log('Project created:', project.title)

    // 4. Create Timeline Stages
    const stages = [
        { project_id: project.id, stage_name: 'Architectural Planning', status: 'complete', display_order: 1, notes: 'Initial site survey and concept designs approved.' },
        { project_id: project.id, stage_name: 'Foundation & Framing', status: 'complete', display_order: 2, notes: 'Main structure framing completed.' },
        { project_id: project.id, stage_name: 'Interior Design', status: 'active', display_order: 3, notes: 'Currently selecting finishes and furniture layouts.' },
        { project_id: project.id, stage_name: 'Final Inspection', status: 'upcoming', display_order: 4, notes: 'Scheduled for next month.' }
    ]

    // Delete old stages first
    await supabase.from('timeline_stages').delete().eq('project_id', project.id)

    const { error: stageError } = await supabase
        .from('timeline_stages')
        .insert(stages)

    if (stageError) {
        console.error('Error creating stages:', stageError.message)
        return
    }
    console.log('Timeline stages created.')

    console.log('\n--- SUCCESS ---')
    console.log('EMAIL:    ', testEmail)
    console.log('PASSWORD: ', testPassword)
    console.log('---------------')
}

seed()
