'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Search, MoreHorizontal, Shield, Users, UserPlus } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// Mock team data
const mockTeamMembers = [
  {
    id: '1',
    full_name: 'John Doe',
    email: 'john.doe@company.com',
    role: 'admin' as const,
    avatar_url: null,
    last_login: '2024-08-22T10:30:00Z',
    created_at: '2024-01-15T09:00:00Z',
  },
  {
    id: '2',
    full_name: 'Jane Smith',
    email: 'jane.smith@company.com',
    role: 'manager' as const,
    avatar_url: null,
    last_login: '2024-08-22T08:45:00Z',
    created_at: '2024-02-01T14:20:00Z',
  },
  {
    id: '3',
    full_name: 'Mike Johnson',
    email: 'mike.johnson@company.com',
    role: 'member' as const,
    avatar_url: null,
    last_login: '2024-08-21T16:15:00Z',
    created_at: '2024-08-20T11:30:00Z',
  },
]

const roleColors = {
  admin: 'bg-red-100 text-red-800',
  manager: 'bg-blue-100 text-blue-800',
  member: 'bg-green-100 text-green-800',
}

const rolePermissions = {
  admin: 'Full access to all features and settings',
  manager: 'Can manage vendors, subscriptions, and team members',
  member: 'Can view data and create subscriptions',
}

export default function TeamPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [, setInviteDialogOpen] = useState(false)

  const filteredMembers = mockTeamMembers.filter(member =>
    member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
  }

  const formatLastLogin = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInHours / 24)

    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInDays < 7) return `${diffInDays}d ago`
    return date.toLocaleDateString()
  }

  const handleInviteUser = () => {
    setInviteDialogOpen(true)
    // TODO: Implement user invitation
  }

  const handleRoleChange = (userId: string, newRole: string) => {
    // TODO: Implement role change
    console.log('Changing role for user:', userId, 'to:', newRole)
  }

  const handleRemoveUser = (userId: string) => {
    // TODO: Implement user removal
    console.log('Removing user:', userId)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-600">Manage your team members and their permissions</p>
        </div>
        <Button onClick={handleInviteUser}>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite Member
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredMembers.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredMembers.filter(m => m.role === 'admin').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Today</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredMembers.filter(m => {
                const lastLogin = new Date(m.last_login)
                const today = new Date()
                return lastLogin.toDateString() === today.toDateString()
              }).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search team members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Team Members */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map((member) => (
          <Card key={member.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={member.avatar_url || undefined} />
                    <AvatarFallback>{getInitials(member.full_name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{member.full_name}</CardTitle>
                    <CardDescription>{member.email}</CardDescription>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleRoleChange(member.id, 'admin')}>
                      Make Admin
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleRoleChange(member.id, 'manager')}>
                      Make Manager
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleRoleChange(member.id, 'member')}>
                      Make Member
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleRemoveUser(member.id)}
                      className="text-red-600"
                    >
                      Remove from team
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Role:</span>
                  <Badge className={roleColors[member.role]}>
                    {member.role}
                  </Badge>
                </div>
                
                <div className="text-sm text-gray-600">
                  {rolePermissions[member.role]}
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Last active:</span>
                  <span>{formatLastLogin(member.last_login)}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Joined:</span>
                  <span>{new Date(member.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No team members found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by inviting your first team member.'}
          </p>
          {!searchTerm && (
            <div className="mt-6">
              <Button onClick={handleInviteUser}>
                <UserPlus className="mr-2 h-4 w-4" />
                Invite Member
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}