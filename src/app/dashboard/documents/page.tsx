'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { DocumentUpload } from '@/components/documents/document-upload'
import { Plus, Search, FileText, Download, Trash2, Eye, Calendar } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// Mock data - will be replaced with Supabase queries
const mockDocuments = [
  {
    id: '1',
    name: 'Slack Enterprise Agreement.pdf',
    description: 'Annual contract for Slack Enterprise Grid',
    vendor: 'Slack Technologies',
    vendor_id: '1',
    subscription: 'Slack Pro',
    subscription_id: '1',
    file_size: 2458000, // bytes
    mime_type: 'application/pdf',
    uploaded_by: 'John Doe',
    created_at: '2024-08-15T10:30:00Z',
    file_path: '/documents/slack-contract-2024.pdf',
  },
  {
    id: '2',
    name: 'GitHub Terms of Service.pdf',
    description: 'GitHub Team plan terms and conditions',
    vendor: 'GitHub',
    vendor_id: '2',
    subscription: 'GitHub Team',
    subscription_id: '2',
    file_size: 1245000,
    mime_type: 'application/pdf',
    uploaded_by: 'Jane Smith',
    created_at: '2024-08-10T14:20:00Z',
    file_path: '/documents/github-terms-2024.pdf',
  },
  {
    id: '3',
    name: 'Adobe Invoice - August 2024.pdf',
    description: 'Monthly invoice for Creative Cloud licenses',
    vendor: 'Adobe',
    vendor_id: '4',
    subscription: 'Adobe Creative Cloud',
    subscription_id: '4',
    file_size: 892000,
    mime_type: 'application/pdf',
    uploaded_by: 'John Doe',
    created_at: '2024-08-01T09:15:00Z',
    file_path: '/documents/adobe-invoice-aug-2024.pdf',
  },
]

export default function DocumentsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isUploadOpen, setIsUploadOpen] = useState(false)

  const filteredDocuments = mockDocuments.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return '📄'
    if (mimeType.includes('image')) return '🖼️'
    if (mimeType.includes('document') || mimeType.includes('word')) return '📝'
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return '📊'
    return '📎'
  }

  const handleDownload = (document: typeof mockDocuments[0]) => {
    // TODO: Implement actual file download from Supabase Storage
    console.log('Downloading:', document.name)
  }

  const handleView = (document: typeof mockDocuments[0]) => {
    // TODO: Implement document viewer
    console.log('Viewing:', document.name)
  }

  const handleDelete = (document: typeof mockDocuments[0]) => {
    // TODO: Implement document deletion
    console.log('Deleting:', document.name)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-600">Manage contracts, invoices, and other vendor documents</p>
        </div>
        <Button onClick={() => setIsUploadOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredDocuments.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Size</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatFileSize(filteredDocuments.reduce((total, doc) => total + doc.file_size, 0))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Uploads</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredDocuments.filter(doc => {
                const uploadDate = new Date(doc.created_at)
                const weekAgo = new Date()
                weekAgo.setDate(weekAgo.getDate() - 7)
                return uploadDate > weekAgo
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocuments.map((document) => (
          <Card key={document.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="text-2xl">{getFileIcon(document.mime_type)}</div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{document.name}</CardTitle>
                    <CardDescription className="mt-1">
                      <Badge variant="outline" className="text-xs">
                        {document.vendor}
                      </Badge>
                    </CardDescription>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleView(document)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDownload(document)}>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDelete(document)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              {document.description && (
                <p className="text-sm text-gray-600 mb-4">{document.description}</p>
              )}
              
              {document.subscription && (
                <div className="mb-4">
                  <Badge variant="secondary" className="text-xs">
                    {document.subscription}
                  </Badge>
                </div>
              )}
              
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex justify-between">
                  <span>Size:</span>
                  <span>{formatFileSize(document.file_size)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Uploaded by:</span>
                  <span>{document.uploaded_by}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span>{new Date(document.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDocuments.length === 0 && (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No documents found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by uploading your first document.'}
          </p>
          {!searchTerm && (
            <div className="mt-6">
              <Button onClick={() => setIsUploadOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Upload Document
              </Button>
            </div>
          )}
        </div>
      )}

      <DocumentUpload
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />
    </div>
  )
}