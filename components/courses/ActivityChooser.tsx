import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, FileText, BookOpen, Upload, Megaphone, Link as LinkIcon, FolderPlus } from 'lucide-react';

interface ActivityChooserProps {
    onAddActivity: (type: string) => void;
    onAddSubsection: () => void;
}

export function ActivityChooser({ onAddActivity, onAddSubsection }: ActivityChooserProps) {
    const [isOpen, setIsOpen] = useState(false);

    const activities = [
        { type: 'assignment', label: 'Assignment', icon: Upload, description: 'Collect submissions from students' },
        { type: 'quiz', label: 'Quiz', icon: FileText, description: 'Assess student learning' },
    ];

    const resources = [
        { type: 'file', label: 'File', icon: FileText, description: 'Upload a document' },
        { type: 'book', label: 'Book', icon: BookOpen, description: 'Multi-page resource' },
        { type: 'url', label: 'External URL', icon: LinkIcon, description: 'Link to a web page' },
        { type: 'announcement', label: 'Announcement', icon: Megaphone, description: 'Course updates' },
    ];

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full bg-primary/10 hover:bg-primary/20 text-primary">
                        <Plus className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center">
                    <DropdownMenuItem onSelect={() => setIsOpen(true)}>
                        <FileText className="mr-2 h-4 w-4" />
                        <span>Activity or resource</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={onAddSubsection}>
                        <FolderPlus className="mr-2 h-4 w-4" />
                        <span>Subsection</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Add an activity or resource</DialogTitle>
                    <DialogDescription>
                        Select the type of content you want to add to this section.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div>
                        <h3 className="mb-3 text-sm font-medium text-muted-foreground uppercase tracking-wider">Activities</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {activities.map((item) => (
                                <Button
                                    key={item.type}
                                    variant="outline"
                                    className="h-auto flex-col items-start p-4 space-y-2 hover:border-primary hover:bg-primary/5"
                                    onClick={() => {
                                        onAddActivity(item.type);
                                        setIsOpen(false);
                                    }}
                                >
                                    <div className="flex items-center w-full">
                                        <div className="p-2 rounded-md bg-primary/10 text-primary mr-3">
                                            <item.icon className="h-5 w-5" />
                                        </div>
                                        <span className="font-semibold">{item.label}</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground text-left line-clamp-2">
                                        {item.description}
                                    </span>
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="mb-3 text-sm font-medium text-muted-foreground uppercase tracking-wider">Resources</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {resources.map((item) => (
                                <Button
                                    key={item.type}
                                    variant="outline"
                                    className="h-auto flex-col items-start p-4 space-y-2 hover:border-primary hover:bg-primary/5"
                                    onClick={() => {
                                        onAddActivity(item.type);
                                        setIsOpen(false);
                                    }}
                                >
                                    <div className="flex items-center w-full">
                                        <div className="p-2 rounded-md bg-blue-500/10 text-blue-500 mr-3">
                                            <item.icon className="h-5 w-5" />
                                        </div>
                                        <span className="font-semibold">{item.label}</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground text-left line-clamp-2">
                                        {item.description}
                                    </span>
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
