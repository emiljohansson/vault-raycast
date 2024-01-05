import { LocalStorage, getPreferenceValues } from '@raycast/api'
import { SupportedStorage, createClient } from '@supabase/supabase-js'

export interface Account {
	id: number
	website: string
	username: string
	password: string
}

const { supabaseUrl, supabaseKey } = getPreferenceValues()

export const supabase = createClient(supabaseUrl, supabaseKey, {
	auth: {
		storage: LocalStorage as SupportedStorage,
	},
})
