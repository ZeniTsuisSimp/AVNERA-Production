import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { UserService } from '@/lib/services/user-service'

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET || ''

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text()
    const headerPayload = await headers()
    const svixHeaders = {
      'svix-id': headerPayload.get('svix-id')!,
      'svix-timestamp': headerPayload.get('svix-timestamp')!,
      'svix-signature': headerPayload.get('svix-signature')!,
    }

    const webhook = new Webhook(webhookSecret)
    let event: any

    try {
      event = webhook.verify(payload, svixHeaders)
    } catch (err) {
      console.error('Error verifying webhook:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const { type, data } = event

    switch (type) {
      case 'user.created':
        try {
          // Create user profile in our database
          await (UserService as any).initializeUser({
            id: data.id,
            email: data.email_addresses[0]?.email_address || '',
            first_name: data.first_name || '',
            last_name: data.last_name || '',
          })
          console.log(`User profile created for ${data.id}`)
        } catch (error) {
          console.error('Error creating user profile:', error)
          return NextResponse.json({ error: 'Failed to create user profile' }, { status: 500 })
        }
        break

      case 'user.updated':
        try {
          // Update user profile in our database
          await (UserService as any).profile.updateProfile(data.id, {
            email: data.email_addresses[0]?.email_address || '',
            first_name: data.first_name || '',
            last_name: data.last_name || '',
          })
          console.log(`User profile updated for ${data.id}`)
        } catch (error) {
          console.error('Error updating user profile:', error)
          return NextResponse.json({ error: 'Failed to update user profile' }, { status: 500 })
        }
        break

      case 'user.deleted':
        // Note: In a production app, you might want to anonymize rather than delete
        // user data to maintain referential integrity
        console.log(`User ${data.id} was deleted`)
        break

      default:
        console.log(`Unhandled event type: ${type}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
