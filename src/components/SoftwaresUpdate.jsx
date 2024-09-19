import { invoke } from '@tauri-apps/api/tauri';
import { notifications } from '@mantine/notifications';

export async function SoftwaresUpdate() {
    // invoke list in rust, with two param: false, false
    try {
        const softs = await invoke('list')
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

export async function SoftwareUpgrade(sname) {
    // invoke search in rust, with one param: software name
    try {
        const softs = await invoke('search', { name: sname })
    } catch (error) {

    }
}