import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Calendar, Clock } from "lucide-react";

interface AnnouncementViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    announcement: any;
}

export function AnnouncementViewModal({ isOpen, onClose, announcement }: AnnouncementViewModalProps) {
    if (!announcement) return null;

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'bg-red-500 hover:bg-red-600';
            case 'high': return 'bg-orange-500 hover:bg-orange-600';
            case 'low': return 'bg-blue-500 hover:bg-blue-600';
            default: return 'bg-gray-500 hover:bg-gray-600';
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <div className="flex justify-between items-start pr-8">
                        <DialogTitle className="text-xl">{announcement.title}</DialogTitle>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                        <Badge className={getPriorityColor(announcement.priority)}>
                            {announcement.priority}
                        </Badge>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Posted {format(new Date(announcement.created_at), "PPP")}
                        </span>
                        {announcement.author_name && (
                            <span className="text-sm text-muted-foreground">
                                by {announcement.author_name}
                            </span>
                        )}
                    </div>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">
                        {announcement.content}
                    </div>



                    {announcement.scheduled_at && new Date(announcement.scheduled_at) > new Date() && (
                        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-md text-sm text-blue-700">
                            <Calendar className="h-4 w-4" />
                            <span className="font-medium">Scheduled for:</span>
                            <span>{format(new Date(announcement.scheduled_at), "PPP p")}</span>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button onClick={onClose}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
