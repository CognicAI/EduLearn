import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Crown, Edit, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PermissionBadgeProps {
    isOwner?: boolean;
    canEdit?: boolean;
    canDelete?: boolean;
    className?: string;
}

export function PermissionBadge({
    isOwner,
    canEdit,
    canDelete,
    className
}: PermissionBadgeProps) {
    // Determine the permission level
    if (isOwner) {
        return (
            <Badge
                variant="default"
                className={cn('flex items-center gap-1', className)}
            >
                <Crown className="h-3 w-3" />
                Owner
            </Badge>
        );
    }

    if (canEdit) {
        return (
            <Badge
                variant="secondary"
                className={cn(
                    'flex items-center gap-1 bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300',
                    className
                )}
            >
                <Edit className="h-3 w-3" />
                Can Edit
            </Badge>
        );
    }

    // Read-only access
    return (
        <Badge
            variant="outline"
            className={cn(
                'flex items-center gap-1 text-muted-foreground',
                className
            )}
        >
            <Eye className="h-3 w-3" />
            Read Only
        </Badge>
    );
}

// Multi-badge version to show all permissions
export function PermissionBadges({
    isOwner,
    canEdit,
    canDelete,
    className
}: PermissionBadgeProps) {
    return (
        <div className={cn('flex items-center gap-2', className)}>
            {isOwner && (
                <Badge variant="default" className="flex items-center gap-1">
                    <Crown className="h-3 w-3" />
                    Owner
                </Badge>
            )}
            {!isOwner && canEdit && (
                <Badge
                    variant="secondary"
                    className="flex items-center gap-1 bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300"
                >
                    <Edit className="h-3 w-3" />
                    Can Edit
                </Badge>
            )}
            {!isOwner && !canEdit && (
                <Badge
                    variant="outline"
                    className="flex items-center gap-1 text-muted-foreground"
                >
                    <Eye className="h-3 w-3" />
                    Read Only
                </Badge>
            )}
        </div>
    );
}
