import { invoke } from '@tauri-apps/api/tauri';
import { notifications } from '@mantine/notifications';

export async function SoftwaresLists() {
    // invoke softs in rust, with two param: false, false
    try {
        const softs = await invoke('softs', { cached: false, flush: false })
        notifications.show(
            { title: 'INFO', message: 'Get softwares list success' }
        )
        return softs
    } catch (error) {
        notifications.show(
            { title: 'ERROR', message: 'Get softwares list failed' }
        )
        return null
    }
}