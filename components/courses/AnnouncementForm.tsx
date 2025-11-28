import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface AnnouncementFormProps {
    isOpen: boolean;
    onClose: () => void;
    courseId: string;
    onSuccess: () => void;
}

export function AnnouncementForm({ isOpen, onClose, courseId, onSuccess }: AnnouncementFormProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [priority, setPriority] = useState('medium');
    const [scheduleDate, setScheduleDate] = useState<Date | undefined>(undefined);
    const [scheduleTime, setScheduleTime] = useState('09:00');
    const [showConfirm, setShowConfirm] = useState(false);
    const [actionType, setActionType] = useState<'publish' | 'schedule'>('publish');

    const combineDateAndTime = (date: Date | undefined, time: string) => {
        if (!date) return null;
        const [hours, minutes] = time.split(':').map(Number);
        const newDate = new Date(date);
        newDate.setHours(hours);
        newDate.setMinutes(minutes);
        return newDate;
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');

            const finalScheduledAt = actionType === 'schedule'
                ? combineDateAndTime(scheduleDate, scheduleTime)?.toISOString()
                : null;

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}/announcements`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title,
                    content,
                    priority,
                    scheduled_at: finalScheduledAt,
                    expires_at: null
                })
            });

            const data = await response.json();

            if (data.success) {
                toast({
                    title: 'Success',
                    description: actionType === 'publish' ? 'Announcement published successfully' : 'Announcement scheduled successfully'
                });
                onSuccess();
                onClose();
                resetForm();
            } else {
                throw new Error(data.message || 'Failed to create announcement');
            }
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Something went wrong',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
            setShowConfirm(false);
        }
    };

    const resetForm = () => {
        setTitle('');
        setContent('');
        setPriority('medium');
        setScheduleDate(undefined);
        setScheduleTime('09:00');
        setActionType('publish');
    };

    const handlePreSubmit = (type: 'publish' | 'schedule') => {
        if (!title || !content) {
            toast({
                title: 'Validation Error',
                description: 'Please fill in all required fields',
                variant: 'destructive'
            });
            return;
        }

        if (type === 'schedule' && !scheduleDate) {
            toast({
                title: 'Validation Error',
                description: 'Please select a schedule date',
                variant: 'destructive'
            });
            return;
        }

        setActionType(type);
        setShowConfirm(true);
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Create Announcement</DialogTitle>
                        <DialogDescription>
                            Share updates, news, or important information with your students.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., Midterm Exam Schedule"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="content">Content *</Label>
                            <Textarea
                                id="content"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Write your announcement here..."
                                className="min-h-[150px]"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Priority</Label>
                                <Select value={priority} onValueChange={setPriority}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="urgent">Urgent</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>Schedule Publication (Optional)</Label>
                            <div className="flex items-center gap-4">
                                <div className="flex gap-2 flex-1">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !scheduleDate && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {scheduleDate ? format(scheduleDate, "PPP") : <span>Schedule for later...</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={scheduleDate}
                                                onSelect={setScheduleDate}
                                                initialFocus
                                                disabled={(date) => {
                                                    const today = new Date();
                                                    today.setHours(0, 0, 0, 0);
                                                    const checkDate = new Date(date);
                                                    checkDate.setHours(0, 0, 0, 0);
                                                    return checkDate < today;
                                                }}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <Input
                                        type="time"
                                        value={scheduleTime}
                                        onChange={(e) => setScheduleTime(e.target.value)}
                                        className="w-[120px]"
                                        disabled={!scheduleDate}
                                    />
                                </div>
                                {scheduleDate && (
                                    <Button variant="ghost" size="sm" onClick={() => setScheduleDate(undefined)}>
                                        Clear
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={onClose}>Cancel</Button>
                        <div className="flex gap-2">
                            {scheduleDate ? (
                                <Button onClick={() => handlePreSubmit('schedule')}>
                                    Schedule At
                                </Button>
                            ) : (
                                <Button onClick={() => handlePreSubmit('publish')}>
                                    Publish Now
                                </Button>
                            )}
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Confirmation Modal */}
            <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm {actionType === 'publish' ? 'Publication' : 'Scheduling'}</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to {actionType === 'publish' ? 'publish this announcement immediately' : `schedule this announcement for ${scheduleDate ? format(scheduleDate, 'PPP') : ''}`}?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowConfirm(false)}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirm
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
