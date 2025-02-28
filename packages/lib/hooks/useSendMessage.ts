import { useFrappePostCall } from 'frappe-react-sdk'
import { Message } from '@raven/types/common/Message'
import { RavenMessage } from '@raven/types/RavenMessaging/RavenMessage'

export const useSendMessage = (channelID: string, noOfFiles: number, uploadFiles: () => Promise<RavenMessage[]>, onMessageSent: (messages: RavenMessage[]) => void, selectedMessage?: Message | null) => {

    const { call, loading } = useFrappePostCall<{ message: RavenMessage }>('raven.api.raven_message.send_message')

    const sendMessage = async (content: string, json?: any): Promise<void> => {

        if (content) {

            return call({
                channel_id: channelID,
                text: content,
                json_content: json,
                is_reply: selectedMessage ? 1 : 0,
                linked_message: selectedMessage ? selectedMessage.name : null
            })
                .then((res) => onMessageSent([res.message]))
                .then(() => uploadFiles())
                .then((res) => {
                    onMessageSent(res)
                })
        } else if (noOfFiles > 0) {
            return uploadFiles()
                .then((res) => {
                    onMessageSent(res)
                })
        } else {
            return Promise.resolve()
        }
    }


    return {
        sendMessage,
        loading
    }
}