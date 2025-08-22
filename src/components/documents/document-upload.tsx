'use client'

import { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Upload, X, FileText, AlertCircle } from 'lucide-react'

interface DocumentUploadProps {
  isOpen: boolean
  onClose: () => void
}

// Mock data - in real app, fetch from Supabase
const mockVendors = [
  { id: '1', name: 'Slack Technologies' },
  { id: '2', name: 'GitHub' },
  { id: '3', name: 'Notion Labs' },
  { id: '4', name: 'Adobe' },
]

const mockSubscriptions = [
  { id: '1', name: 'Slack Pro', vendor_id: '1' },
  { id: '2', name: 'GitHub Team', vendor_id: '2' },
  { id: '3', name: 'Notion Pro', vendor_id: '3' },
  { id: '4', name: 'Adobe Creative Cloud', vendor_id: '4' },
]

export function DocumentUpload({ isOpen, onClose }: DocumentUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [vendorId, setVendorId] = useState('')
  const [subscriptionId, setSubscriptionId] = useState('')
  const [documentName, setDocumentName] = useState('')
  const [description, setDescription] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filteredSubscriptions = mockSubscriptions.filter(
    sub => !vendorId || sub.vendor_id === vendorId
  )

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setDocumentName(file.name)
      setError(null)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      setSelectedFile(file)
      setDocumentName(file.name)
      setError(null)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const removeFile = () => {
    setSelectedFile(null)
    setDocumentName('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedFile) {
      setError('Please select a file to upload')
      return
    }

    setUploading(true)
    setUploadProgress(0)
    setError(null)

    try {
      // TODO: Replace with actual Supabase Storage upload
      console.log('Uploading file:', {
        file: selectedFile,
        name: documentName,
        description,
        vendorId,
        subscriptionId,
      })

      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i)
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // Simulate API call to save document metadata
      await new Promise(resolve => setTimeout(resolve, 500))

      // Reset form and close dialog
      setSelectedFile(null)
      setDocumentName('')
      setDescription('')
      setVendorId('')
      setSubscriptionId('')
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const isValidFileType = (file: File) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain',
    ]
    return allowedTypes.includes(file.type)
  }

  const reset = () => {
    setSelectedFile(null)
    setDocumentName('')
    setDescription('')
    setVendorId('')
    setSubscriptionId('')
    setError(null)
    setUploadProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Upload contracts, invoices, or other documents related to your vendors and subscriptions.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {/* File Upload Area */}
          <div className="space-y-4">
            <Label>Document File *</Label>
            {!selectedFile ? (
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <div className="text-lg font-medium text-gray-900 mb-2">
                  Drop files here or click to browse
                </div>
                <div className="text-sm text-gray-500 mb-4">
                  Supports PDF, Word, Excel, Images, and Text files
                </div>
                <Button type="button" variant="outline" size="sm">
                  Choose File
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt"
                />
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-8 w-8 text-blue-500" />
                    <div>
                      <div className="font-medium">{selectedFile.name}</div>
                      <div className="text-sm text-gray-500">
                        {formatFileSize(selectedFile.size)}
                      </div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeFile}
                    disabled={uploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                {!isValidFileType(selectedFile) && (
                  <Alert variant="destructive" className="mt-3">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      This file type is not supported. Please select a valid document file.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}
          
          {/* Form Fields */}
          <div className="space-y-2">
            <Label htmlFor="document_name">Document Name *</Label>
            <Input
              id="document_name"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              placeholder="Enter document name"
              required
              disabled={uploading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the document..."
              rows={3}
              disabled={uploading}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vendor">Vendor</Label>
              <Select value={vendorId} onValueChange={setVendorId} disabled={uploading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a vendor" />
                </SelectTrigger>
                <SelectContent>
                  {mockVendors.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subscription">Subscription (Optional)</Label>
              <Select value={subscriptionId} onValueChange={setSubscriptionId} disabled={uploading || !vendorId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a subscription" />
                </SelectTrigger>
                <SelectContent>
                  {filteredSubscriptions.map((subscription) => (
                    <SelectItem key={subscription.id} value={subscription.id}>
                      {subscription.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={uploading}>
              Cancel
            </Button>
            <Button type="submit" disabled={!selectedFile || uploading || !isValidFileType(selectedFile!)}>
              {uploading ? 'Uploading...' : 'Upload Document'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}