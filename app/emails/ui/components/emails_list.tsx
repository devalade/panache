import { formatDistanceToNow } from 'date-fns'
import { useEmail } from '../hooks/use_email'
import { ScrollArea } from '#common/ui/components/scroll_area'
import { cn } from '#common/ui/lib/cn'
import React from 'react'
import Email from '#emails/database/models/email'

interface EmailsListProps {
  items: Email[]
}

export function EmailsList({ items }: EmailsListProps) {
  const [email, setEmail] = useEmail()

  return (
    <ScrollArea className="h-screen">
      <div className="flex flex-col gap-2 pt-0">
        {items.map((item) => (
          <button
            key={item.id}
            className={cn(
              'flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent',
              email.selected === item.id && 'bg-muted'
            )}
            onClick={() => setEmail({ ...email, selected: item.id })}
          >
            <div className="flex w-full flex-col gap-1">
              <div className="flex items-center">
                <div className="flex items-center gap-2">
                  <div className="font-semibold">{item.subject}</div>
                  {!item.read && <span className="flex h-2 w-2 rounded-full bg-blue-600" />}
                </div>
                <div
                  className={cn(
                    'ml-auto text-xs',
                    email.selected === item.id ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {formatDistanceToNow(new Date(item.createdAt as unknown as string), {
                    addSuffix: true,
                  })}
                </div>
              </div>
              <div className="text-xs font-medium">
                {item.subject ? item.subject : 'No subject'}
              </div>
            </div>
            <div className="line-clamp-2 text-xs text-muted-foreground">
              {item.text ? item.text?.substring(0, 300) : 'No content'}
            </div>
          </button>
        ))}
      </div>
    </ScrollArea>
  )
}
