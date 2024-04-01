import { useIonToast } from '@ionic/react';
import { useFrappePostCall } from 'frappe-react-sdk'
import { Link, useHistory } from 'react-router-dom';
import { DMUser } from '@/pages/direct-messages/DirectMessageList';
import { DMChannelListItem, UnreadCountData, useChannelList } from '@/utils/channel/ChannelListProvider';
import { useIsUserActive } from '@/hooks/useIsUserActive';
import { useMemo } from 'react';
import { UserAvatar } from '@/components/common/UserAvatar';
import { Badge, Text } from '@radix-ui/themes';

export const PrivateMessages = ({ users, unread_count }: { users: DMUser[], unread_count?: UnreadCountData }) => {

    const { mutate } = useChannelList()

    const { call } = useFrappePostCall<{ message: string }>("raven.api.raven_channel.create_direct_message_channel")

    const history = useHistory();

    const [toast] = useIonToast();

    const onChannelCreate = async (user_id: string) => {
        return call({ user_id })
            .then((r) => {
                history.push(`channel/${r?.message}`)
                mutate()
            })
            .catch(() => {
                toast({
                    message: `Could not create a message channel with ${user_id}`,
                    color: "danger",
                    duration: 5000,
                    position: 'bottom',
                })
            })
    }


    return <ul className='pb-4'>
        {users.map(dmUser => {
            if (dmUser.channel !== undefined) {
                return <DMChannelItem key={dmUser.name} user={dmUser as DMChannel} unreadCount={unread_count?.channels ?? []} />
            } else {
                return <UserItem key={dmUser.name} user={dmUser} onChannelCreate={onChannelCreate} />
            }
        })}
    </ul>
}

/** This is to be used for users who have a channel */
interface DMChannel extends DMUser {
    channel: DMChannelListItem
}
const DMChannelItem = ({ user, unreadCount }: { user: DMChannel, unreadCount: UnreadCountData['channels'] }) => {

    const unreadCountForChannel = useMemo(() => unreadCount.find((unread) => unread.name == user.channel.name)?.unread_count, [user.channel.name, unreadCount])
    const isActive = useIsUserActive(user.name)

    return <li className='list-none'>
        <Link to={`channel/${user.channel.name}`} className='block px-4 py-2 active:bg-accent active:rounded'>
            <div className='flex justify-between items-center'>
                <div className='flex items-center space-x-2 w-5/6'>
                    <UserAvatar
                        src={user.user_image}
                        alt={user.full_name}
                        size='3'
                        isActive={isActive}
                        isBot={user.type === 'Bot'} />
                    <Text size='3' weight='medium' className='cursor-pointer'>{user.full_name}</Text>
                </div>
                {unreadCountForChannel ? <Badge radius='large' size='2' variant='solid'>{unreadCountForChannel < 100 ? unreadCountForChannel : '99'}</Badge> : null}
            </div>
        </Link>
    </li>
}

const UserItem = ({ user, onChannelCreate }: { user: DMUser, onChannelCreate: (user_id: string) => void }) => {
    const isActive = useIsUserActive(user.name)
    return <li className="flex active:bg-accent active:rounded">
        <button onClick={() => onChannelCreate(user.name)} className='flex px-4 py-2 justify-between items-center w-full'>
            <div className="flex items-center space-x-2 w-full">
                <UserAvatar src={user.user_image} alt={user.full_name} size='3' isActive={isActive} isBot={user.type === 'Bot'} />
                <Text size='3' weight='medium' className='cursor-pointer'>{user.full_name}</Text>
            </div>
        </button>
    </li>
}