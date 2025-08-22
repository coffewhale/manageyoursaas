'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Bell, Building2, CreditCard, FileText, Users } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

interface Activity {
  id: string
  type: 'vendor_added' | 'subscription_created' | 'document_uploaded' | 'renewal_reminder' | 'user_joined'
  title: string
  description: string
  timestamp: string
  read: boolean
  user?: string
  metadata?: Record<string, unknown>
}

// Mock activity data - in real app, this would come from Supabase real-time
const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'vendor_added',
    title: 'New vendor added',
    description: 'Slack Technologies was added to your vendor list',
    timestamp: '2024-08-22T10:30:00Z',
    read: false,
    user: 'John Doe',
  },
  {
    id: '2',
    type: 'subscription_created',
    title: 'New subscription created',
    description: 'GitHub Team subscription was created for $4/user monthly',
    timestamp: '2024-08-22T09:15:00Z',
    read: false,
    user: 'Jane Smith',
  },
  {
    id: '3',
    type: 'document_uploaded',
    title: 'Document uploaded',
    description: 'Adobe Creative Cloud contract uploaded',
    timestamp: '2024-08-22T08:45:00Z',
    read: true,
    user: 'John Doe',
  },
  {
    id: '4',
    type: 'renewal_reminder',
    title: 'Renewal due soon',
    description: 'Notion Pro subscription renews in 5 days',
    timestamp: '2024-08-22T08:00:00Z',
    read: true,
  },
  {
    id: '5',
    type: 'user_joined',
    title: 'New team member',
    description: 'Mike Johnson joined your organization',
    timestamp: '2024-08-21T16:20:00Z',
    read: true,
    user: 'System',
  },
]

export function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>(mockActivities)
  const [isOpen, setIsOpen] = useState(false)

  const unreadCount = activities.filter(activity => !activity.read).length

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'vendor_added':
        return <Building2 className="h-4 w-4 text-blue-500" />
      case 'subscription_created':
        return <CreditCard className="h-4 w-4 text-green-500" />
      case 'document_uploaded':
        return <FileText className="h-4 w-4 text-purple-500" />
      case 'renewal_reminder':
        return <Bell className="h-4 w-4 text-orange-500" />
      case 'user_joined':
        return <Users className="h-4 w-4 text-teal-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const markAsRead = (activityId: string) => {
    setActivities(prev =>
      prev.map(activity =>
        activity.id === activityId ? { ...activity, read: true } : activity
      )
    )
  }

  const markAllAsRead = () => {
    setActivities(prev =>
      prev.map(activity => ({ ...activity, read: true }))
    )
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    const diffInHours = Math.floor(diffInMinutes / 60)
    const diffInDays = Math.floor(diffInHours / 24)

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInDays < 7) return `${diffInDays}d ago`
    return date.toLocaleDateString()
  }

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // In a real app, this would be handled by Supabase real-time subscriptions
      console.log('Checking for new activities...')
    }, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle>Activity Feed</SheetTitle>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                Mark all read
              </Button>
            )}
          </div>
          <SheetDescription>
            Stay updated with real-time changes in your organization
          </SheetDescription>
        </SheetHeader>
        
        <ScrollArea className="h-[calc(100vh-120px)] mt-6">
          <div className="space-y-4">
            {activities.map((activity) => (
              <Card 
                key={activity.id} 
                className={`cursor-pointer transition-colors ${
                  !activity.read ? 'bg-blue-50 border-blue-200' : ''
                }`}
                onClick={() => markAsRead(activity.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.title}
                        </p>
                        {!activity.read && (
                          <div className="h-2 w-2 bg-blue-500 rounded-full" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {activity.description}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-500">
                          {formatTimestamp(activity.timestamp)}
                        </p>
                        {activity.user && (
                          <p className="text-xs text-gray-500">
                            by {activity.user}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {activities.length === 0 && (
              <div className="text-center py-8">
                <Bell className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No activity yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Activity will appear here as your team makes changes
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}