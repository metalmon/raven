import { FrappeProvider, FrappeContext, FrappeConfig } from 'frappe-react-sdk'
import { Navigate, Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from 'react-router-dom'
import { MainPage } from './pages/MainPage'
import { ProtectedRoute } from './utils/auth/ProtectedRoute'
import { UserProvider } from './utils/auth/UserProvider'
import "cal-sans";
import { ThemeProvider } from './ThemeProvider'
import { Toaster } from 'sonner'
import { useStickyState } from './hooks/useStickyState'
import MobileTabsPage from './pages/MobileTabsPage'
import Cookies from 'js-cookie'
import ErrorPage from './pages/ErrorPage'
import WorkspaceSwitcher from './pages/WorkspaceSwitcher'
import WorkspaceSwitcherGrid from './components/layout/WorkspaceSwitcherGrid'
import { init } from 'emoji-mart'
import { useContext, useEffect } from 'react'

declare global {
  interface Window {
    frappe: {
      boot: {
        sitename: string;
        socketio_port: number;
      };
      react?: {
        context?: any;
      };
    }
  }
}

/** Following keys will not be cached in app cache */
// const NO_CACHE_KEYS = [
//   "frappe.desk.form.load.getdoctype",
//   "frappe.desk.search.search_link",
//   "frappe.model.workflow.get_transitions",
//   "frappe.desk.reportview.get_count",
//   "frappe.core.doctype.server_script.server_script.enabled",
//   "raven.api.message_actions.get_action_defaults",
//   "raven.api.document_link.get_preview_data"
// ]

const CACHE_KEYS = [
  "raven.api.login.get_context",
  "workspaces_list",
  "raven.api.raven_users.get_list",
  "channel_list",
]

const isDesktop = window.innerWidth > 768

const lastWorkspace = localStorage.getItem('ravenLastWorkspace') ?? ''
const lastChannel = localStorage.getItem('ravenLastChannel') ?? ''


// Initialize emoji-mart
init({
  data: async () => {
    const response = await fetch(
      'https://cdn.jsdelivr.net/npm/@emoji-mart/data/sets/14/apple.json',
    )

    return response.json()
  },
  set: 'apple',
})


const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path='/login' lazy={() => import('@/pages/auth/Login')} />
      <Route path='/login-with-email' lazy={() => import('@/pages/auth/LoginWithEmail')} />
      <Route path='/signup' lazy={() => import('@/pages/auth/SignUp')} />
      <Route path='/forgot-password' lazy={() => import('@/pages/auth/ForgotPassword')} />
      <Route path="/" element={<ProtectedRoute />} errorElement={<ErrorPage />}>
        <Route path="/" element={<WorkspaceSwitcher />}>
          <Route index element={lastWorkspace && lastChannel && isDesktop ? <Navigate to={`/${lastWorkspace}/${lastChannel}`} replace /> : lastWorkspace ? <Navigate to={`/${lastWorkspace}`} replace /> : <WorkspaceSwitcherGrid />} />
          <Route path="workspace-explorer" element={<WorkspaceSwitcherGrid />} />
          <Route path="settings" lazy={() => import('./pages/settings/Settings')}>
            <Route index lazy={() => import('./components/feature/userSettings/UserProfile/UserProfile')} />
            <Route path="profile" lazy={() => import('./components/feature/userSettings/UserProfile/UserProfile')} />
            <Route path="users" lazy={() => import('./pages/settings/Users/UserList')} />
            <Route path="appearance" lazy={() => import('./pages/settings/Appearance')} />
            <Route path="preferences" lazy={() => import('./pages/settings/Preferences')} />
            <Route path="hr" lazy={() => import('./pages/settings/Integrations/FrappeHR')} />
            <Route path="document-previews" lazy={() => import('./pages/settings/Integrations/DocumentPreviewTool')} />
            <Route path="workspaces" >
              <Route index lazy={() => import('./pages/settings/Workspaces/WorkspaceList')} />
              <Route path=":ID" lazy={() => import('./pages/settings/Workspaces/ViewWorkspace')} />
            </Route>

            <Route path="emojis" lazy={() => import('./pages/settings/CustomEmojis/CustomEmojiList')} />

            <Route path="bots" >
              <Route index lazy={() => import('./pages/settings/AI/BotList')} />
              <Route path="create" lazy={() => import('./pages/settings/AI/CreateBot')} />
              <Route path=":ID" lazy={() => import('./pages/settings/AI/ViewBot')} />
            </Route>

            <Route path="functions">
              <Route index lazy={() => import('./pages/settings/AI/FunctionList')} />
              <Route path="create" lazy={() => import('./pages/settings/AI/CreateFunction')} />
              <Route path=":ID" lazy={() => import('./pages/settings/AI/ViewFunction')} />
            </Route>

            <Route path="document-notifications">
              <Route index lazy={() => import('./pages/settings/DocumentNotifications/DocumentNotificationList')} />
              <Route path="create" lazy={() => import('./pages/settings/DocumentNotifications/CreateDocumentNotification')} />
              <Route path=":ID" lazy={() => import('./pages/settings/DocumentNotifications/ViewDocumentNotification')} />
            </Route>


            <Route path="instructions">
              <Route index lazy={() => import('./pages/settings/AI/InstructionTemplateList')} />
              <Route path="create" lazy={() => import('./pages/settings/AI/CreateInstructionTemplate')} />
              <Route path=":ID" lazy={() => import('./pages/settings/AI/ViewInstructionTemplate')} />
            </Route>

            <Route path="commands">
              <Route index lazy={() => import('./pages/settings/AI/SavedPromptsList')} />
              <Route path="create" lazy={() => import('./pages/settings/AI/CreateSavedPrompt')} />
              <Route path=":ID" lazy={() => import('./pages/settings/AI/ViewSavedPrompt')} />
            </Route>

            <Route path="openai-settings" lazy={() => import('./pages/settings/AI/OpenAISettings')} />

            <Route path="webhooks">
              <Route index lazy={() => import('./pages/settings/Webhooks/WebhookList')} />
              <Route path="create" lazy={() => import('./pages/settings/Webhooks/CreateWebhook')} />
              <Route path=":ID" lazy={() => import('./pages/settings/Webhooks/ViewWebhook')} />
            </Route>

            <Route path="scheduled-messages">
              <Route index lazy={() => import('./pages/settings/ServerScripts/SchedulerEvents/SchedulerEvents')} />
              <Route path="create" lazy={() => import('./pages/settings/ServerScripts/SchedulerEvents/CreateSchedulerEvent')} />
              <Route path=":ID" lazy={() => import('./pages/settings/ServerScripts/SchedulerEvents/ViewSchedulerEvent')} />
            </Route>

            <Route path="message-actions">
              <Route index lazy={() => import('./pages/settings/MessageActions/MessageActionList')} />
              <Route path="create" lazy={() => import('./pages/settings/MessageActions/CreateMessageAction')} />
              <Route path=":ID" lazy={() => import('./pages/settings/MessageActions/ViewMessageAction')} />
            </Route>
            <Route path="mobile-app" lazy={() => import('./pages/settings/MobileApp')} />
            <Route path="help" lazy={() => import('./pages/settings/HelpAndSupport')} />
          </Route>
          <Route path=":workspaceID" element={<MainPage />}>
            <Route index element={<MobileTabsPage />} />
            <Route path="threads" lazy={() => import('./components/feature/threads/Threads')}>
              <Route path=":threadID" lazy={() => import('./components/feature/threads/ThreadManager/ViewThread')} />
            </Route>
            <Route path="saved-messages" lazy={() => import('./components/feature/saved-messages/SavedMessages')} />

            <Route path=":channelID" lazy={() => import('@/pages/ChatSpace')}>
              <Route path="thread/:threadID" lazy={() => import('./components/feature/threads/ThreadDrawer/ThreadDrawer')} />
            </Route>
          </Route>
        </Route>
      </Route>
      <Route path='*' lazy={() => import('./pages/NotFound')} />
    </>
  ), {
  basename: import.meta.env.VITE_BASE_NAME ? `/${import.meta.env.VITE_BASE_NAME}` : '',
}
)

// Debug component to check FrappeProvider context
function DebugFrappeContext() {
  const context = useContext(FrappeContext) as FrappeConfig;
  
  // Initial context logging
  useEffect(() => {
    console.log('[Raven Debug] Initial FrappeProvider Context:', {
      ...context,
      socketConnected: context?.socket?.connected,
      socketId: context?.socket?.id,
      socketState: {
        connected: context?.socket?.connected,
        disconnected: context?.socket?.disconnected,
        transport: context?.socket?.io?.engine?.transport?.name,
        hostname: window.location.hostname,
        secure: window.location.protocol === 'https:'
      }
    });
  }, []);

  // Socket lifecycle events
  useEffect(() => {
    if (context?.socket) {
      // Connection events
      context.socket.on('connect', () => {
        console.log('[Raven Debug] Socket connected:', {
          id: context.socket?.id,
          transport: context.socket?.io?.engine?.transport?.name,
          secure: window.location.protocol === 'https:',
          timestamp: new Date().toISOString()
        });
      });

      context.socket.on('disconnect', (reason: string) => {
        console.log('[Raven Debug] Socket disconnected:', { 
          reason,
          timestamp: new Date().toISOString(),
          lastSocketId: context.socket?.id
        });
      });

      context.socket.on('error', (error: Error) => {
        console.log('[Raven Debug] Socket error:', {
          error,
          timestamp: new Date().toISOString(),
          socketId: context.socket?.id
        });
      });

      // Message events
      context.socket.on('message_created', (data: any) => {
        console.log('[Raven Debug] Message created event:', {
          ...data,
          timestamp: new Date().toISOString(),
          socketId: context.socket?.id
        });
      });

      context.socket.on('message_edited', (data: any) => {
        console.log('[Raven Debug] Message edited event:', {
          ...data,
          timestamp: new Date().toISOString(),
          socketId: context.socket?.id
        });
      });

      context.socket.on('message_deleted', (data: any) => {
        console.log('[Raven Debug] Message deleted event:', {
          ...data,
          timestamp: new Date().toISOString(),
          socketId: context.socket?.id
        });
      });

      context.socket.on('message_reacted', (data: any) => {
        console.log('[Raven Debug] Message reaction event:', {
          ...data,
          timestamp: new Date().toISOString(),
          socketId: context.socket?.id
        });
      });

      // Channel events
      context.socket.on('channel_list_updated', (data: any) => {
        console.log('[Raven Debug] Channel list updated:', {
          ...data,
          timestamp: new Date().toISOString(),
          socketId: context.socket?.id
        });
      });

      context.socket.on('channel_members_updated', (data: any) => {
        console.log('[Raven Debug] Channel members updated:', {
          ...data,
          timestamp: new Date().toISOString(),
          socketId: context.socket?.id
        });
      });

      // Unread count events
      context.socket.on('raven:unread_channel_count_updated', (data: any) => {
        console.log('[Raven Debug] Unread count updated:', {
          ...data,
          timestamp: new Date().toISOString(),
          socketId: context.socket?.id
        });
      });

      // Reconnection events
      context.socket.io.on('reconnect_attempt', (attempt: number) => {
        console.log('[Raven Debug] Socket reconnection attempt:', {
          attempt,
          timestamp: new Date().toISOString(),
          socketId: context.socket?.id
        });
      });

      context.socket.io.on('reconnect', (attempt: number) => {
        console.log('[Raven Debug] Socket reconnected:', {
          attempt,
          timestamp: new Date().toISOString(),
          socketId: context.socket?.id,
          transport: context.socket?.io?.engine?.transport?.name
        });
      });

      context.socket.io.on('reconnect_error', (error: Error) => {
        console.log('[Raven Debug] Socket reconnection error:', {
          error,
          timestamp: new Date().toISOString(),
          socketId: context.socket?.id
        });
      });

      // Cleanup function
      return () => {
        context.socket?.off('connect');
        context.socket?.off('disconnect');
        context.socket?.off('error');
        context.socket?.off('message_created');
        context.socket?.off('message_edited');
        context.socket?.off('message_deleted');
        context.socket?.off('message_reacted');
        context.socket?.off('channel_list_updated');
        context.socket?.off('channel_members_updated');
        context.socket?.off('raven:unread_channel_count_updated');
        context.socket?.io.off('reconnect_attempt');
        context.socket?.io.off('reconnect');
        context.socket?.io.off('reconnect_error');
      };
    }
  }, [context?.socket]);

  return null;
}

function App() {
  const [appearance, setAppearance] = useStickyState<'light' | 'dark' | 'inherit'>('dark', 'appearance');

  // Debug logging for production
  console.log('Before FrappeProvider:', {
    frappe: window.frappe,
    boot: window.frappe?.boot,
    location: window.location.origin,
    protocol: window.location.protocol,
    socketPort: window.frappe?.boot?.socketio_port,
    siteName: window.frappe?.boot?.sitename,
    wsUrl: window.location.port ? 
      `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.hostname}:${window.frappe?.boot?.socketio_port}` :
      `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.hostname}`
  });

  // We not need to pass sitename if the Frappe version is v14.

  const getSiteName = () => {
    // @ts-ignore
    if (window.frappe?.boot?.versions?.frappe.startsWith('14')) {
      return import.meta.env.VITE_SITE_NAME
    }
    // @ts-ignore
    else {
      // @ts-ignore
      return window.frappe?.boot?.sitename ?? import.meta.env.VITE_SITE_NAME
    }
  }

  return (
    <FrappeProvider
      url={window.location.origin}
      socketPort={window.location.port ? (window.frappe.boot.socketio_port ?? 9000).toString() : ''}
      swrConfig={{
        errorRetryCount: 2,
        provider: localStorageProvider
      }}
      siteName={window.frappe.boot.sitename}
    >
      <DebugFrappeContext />
      <UserProvider>
        <Toaster richColors />
        <ThemeProvider
          appearance={appearance}
          // grayColor='slate'
          accentColor='iris'
          panelBackground='translucent'
          setAppearance={setAppearance}>
          <RouterProvider router={router} />
        </ThemeProvider>
      </UserProvider>
    </FrappeProvider>
  )
}

function localStorageProvider() {
  // When initializing, we restore the data from `localStorage` into a map.
  // Check if local storage is recent (less than a week). Else start with a fresh cache.
  const timestamp = localStorage.getItem('app-cache-timestamp')
  let cache = '[]'
  if (timestamp && Date.now() - parseInt(timestamp) < 7 * 24 * 60 * 60 * 1000) {
    const localCache = localStorage.getItem('app-cache')
    if (localCache) {
      cache = localCache
    }
  }
  const map = new Map<string, any>(JSON.parse(cache))

  // Before unloading the app, we write back all the data into `localStorage`.
  window.addEventListener('beforeunload', () => {


    // Check if the user is logged in
    const user_id = Cookies.get('user_id')
    if (!user_id || user_id === 'Guest') {
      localStorage.removeItem('app-cache')
      localStorage.removeItem('app-cache-timestamp')
    } else {
      const entries = map.entries()

      const cacheEntries = []

      for (const [key, value] of entries) {

        let hasCacheKey = false
        for (const cacheKey of CACHE_KEYS) {
          if (key.includes(cacheKey)) {
            hasCacheKey = true
            break
          }
        }

        // Cache only the keys that are in CACHE_KEYS
        if (hasCacheKey) {
          cacheEntries.push([key, value])
        }
      }
      const appCache = JSON.stringify(cacheEntries)
      localStorage.setItem('app-cache', appCache)
      localStorage.setItem('app-cache-timestamp', Date.now().toString())
    }

  })

  // We still use the map for write & read for performance.
  return map
}

export default App