'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  AlertTriangle, 
  Calendar, 
  Clock, 
  DollarSign, 
  RefreshCw,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { subscriptionService } from '@/lib/subscription-service'
import { RenewalAlert } from '@/types/subscription'
import { formatCurrency } from '@/types/subscription'

interface RenewalAlertsProps {
  onRenewalAction?: (alertId: string) => void
  showActions?: boolean
  limit?: number
}

export function RenewalAlerts({ onRenewalAction, showActions = true, limit }: RenewalAlertsProps) {
  const [alerts, setAlerts] = useState<RenewalAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processingAlerts, setProcessingAlerts] = useState<Set<string>>(new Set())

  const fetchRenewalAlerts = async () => {
    try {
      setLoading(true)
      const renewalAlerts = await subscriptionService.getRenewalAlerts()
      
      let filteredAlerts = renewalAlerts
      if (limit) {
        filteredAlerts = renewalAlerts.slice(0, limit)
      }
      
      setAlerts(filteredAlerts)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch renewal alerts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRenewalAlerts()
  }, [limit])

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'overdue':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'urgent':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case 'soon':
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <Calendar className="h-4 w-4 text-blue-500" />
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'urgent':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'soon':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  const formatRenewalDate = (dateString: string, daysUntil: number) => {
    const date = new Date(dateString).toLocaleDateString()
    
    if (daysUntil < 0) {
      return `${date} (${Math.abs(daysUntil)} days overdue)`
    } else if (daysUntil === 0) {
      return `${date} (Today)`
    } else if (daysUntil === 1) {
      return `${date} (Tomorrow)`
    } else {
      return `${date} (in ${daysUntil} days)`
    }
  }

  const handleRenewalAction = async (alertId: string, action: 'renew' | 'cancel') => {
    setProcessingAlerts(prev => new Set(prev).add(alertId))
    
    try {
      const alert = alerts.find(a => a.id === alertId)
      if (!alert) return

      if (action === 'renew') {
        await subscriptionService.renewSubscription(alert.subscription_id)
      } else if (action === 'cancel') {
        await subscriptionService.cancelSubscription(alert.subscription_id)
      }

      // Refresh alerts
      await fetchRenewalAlerts()
      onRenewalAction?.(alertId)
    } catch (err) {
      console.error('Failed to process renewal action:', err)
    } finally {
      setProcessingAlerts(prev => {
        const newSet = new Set(prev)
        newSet.delete(alertId)
        return newSet
      })
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Renewal Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            Loading renewal alerts...
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Renewal Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Renewal Alerts
          </CardTitle>
          <CardDescription>
            All subscriptions are up to date with no upcoming renewals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p>No renewal alerts at this time</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Renewal Alerts
            </CardTitle>
            <CardDescription>
              {alerts.length} subscription{alerts.length === 1 ? '' : 's'} requiring attention
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={fetchRenewalAlerts}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-4 rounded-lg border transition-colors ${getUrgencyColor(alert.urgency)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                {getUrgencyIcon(alert.urgency)}
                <div className="flex-1">
                  <div className="font-medium">{alert.subscription_name}</div>
                  <div className="text-sm opacity-75">{alert.vendor_name}</div>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      {formatCurrency(alert.cost, alert.currency)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatRenewalDate(alert.renewal_date, alert.days_until_renewal)}
                    </div>
                    {alert.auto_renew && (
                      <Badge variant="secondary" className="text-xs">
                        Auto-renew
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {showActions && (
                <div className="flex gap-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRenewalAction(alert.id, 'renew')}
                    disabled={processingAlerts.has(alert.id)}
                  >
                    {processingAlerts.has(alert.id) ? (
                      <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      <CheckCircle className="h-3 w-3 mr-1" />
                    )}
                    Renew
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRenewalAction(alert.id, 'cancel')}
                    disabled={processingAlerts.has(alert.id)}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    {processingAlerts.has(alert.id) ? (
                      <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      <XCircle className="h-3 w-3 mr-1" />
                    )}
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}