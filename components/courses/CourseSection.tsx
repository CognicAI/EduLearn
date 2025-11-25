import React, { useState } from 'react';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, ChevronRight, MoreVertical, Pencil, Trash, Eye, EyeOff, GripVertical, FileText, Upload, BookOpen, Link as LinkIcon, PlayCircle, CheckCircle, Download } from 'lucide-react';
import { ActivityChooser } from './ActivityChooser';
import { Badge } from "@/components/ui/badge";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export interface CourseItem {
    id: string;
    type: 'lesson' | 'assignment' | 'file' | 'quiz' | 'announcement';
    title: string;
    url?: string;
    video_url?: string;
    completed?: boolean;
    duration?: number; // minutes
    dueDate?: string;
    sortOrder?: number;
}

import { Module } from './CourseStructure';

interface CourseSectionProps {
    id: string;
    title: string;
    items: CourseItem[];
    subsections?: Module[];
    isEditing: boolean;
    onRename: (moduleId: string, newTitle: string) => void;
    onDelete: (moduleId: string) => void;
    onAddItem: (moduleId: string, type: string) => void;
    onDeleteItem: (moduleId: string, itemId: string, type: string) => void;
    onEditItem: (item: CourseItem) => void;
    dragHandleProps?: any;
    isOpen?: boolean;
    onOpenChange?: (isOpen: boolean) => void;
    onAddSubsection?: (parentId: string, title: string) => void;
}

export function CourseSection({
    id,
    title,
    items,
    subsections = [],
    isEditing,
    onRename,
    onDelete,
    onAddItem,
    onDeleteItem,
    onEditItem,
    dragHandleProps,
    isOpen: controlledIsOpen,
    onOpenChange: controlledOnOpenChange,
    onAddSubsection
}: CourseSectionProps) {
    const [internalIsOpen, setInternalIsOpen] = useState(true);
    const [isRenaming, setIsRenaming] = useState(false);
    const [tempTitle, setTempTitle] = useState(title);

    const isControlled = controlledIsOpen !== undefined;
    const isOpen = isControlled ? controlledIsOpen : internalIsOpen;
    const setIsOpen = isControlled ? controlledOnOpenChange : setInternalIsOpen;

    const handleRenameSubmit = () => {
        onRename(id, tempTitle);
        setIsRenaming(false);
    };

    const getItemIcon = (type: string) => {
        switch (type) {
            case 'lesson': return <PlayCircle className="h-5 w-5 text-blue-500" />;
            case 'assignment': return <Upload className="h-5 w-5 text-pink-500" />;
            case 'file': return <FileText className="h-5 w-5 text-orange-500" />;
            case 'quiz': return <CheckCircle className="h-5 w-5 text-green-500" />;
            default: return <FileText className="h-5 w-5 text-gray-500" />;
        }
    };

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const handleAddSubsection = () => {
        const title = prompt("Enter subsection title:");
        if (title && onAddSubsection) {
            onAddSubsection(id, title);
        }
    };

    return (
        <div ref={setNodeRef} style={style} className="mb-4">
            <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border rounded-lg bg-card text-card-foreground shadow-sm">
                <div className="flex items-center p-4 bg-muted/30 rounded-t-lg">
                    {isEditing && (
                        <div {...listeners} {...attributes} className="mr-2 cursor-grab active:cursor-grabbing text-muted-foreground">
                            <GripVertical className="h-5 w-5" />
                        </div>
                    )}

                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="p-0 hover:bg-transparent mr-2">
                            {isOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                        </Button>
                    </CollapsibleTrigger>

                    <div className="flex-1 flex items-center">
                        {isRenaming ? (
                            <div className="flex items-center gap-2 w-full max-w-md">
                                <Input
                                    value={tempTitle}
                                    onChange={(e) => setTempTitle(e.target.value)}
                                    className="h-8"
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleRenameSubmit();
                                        if (e.key === 'Escape') setIsRenaming(false);
                                    }}
                                />
                                <Button size="sm" onClick={handleRenameSubmit}>Save</Button>
                                <Button size="sm" variant="ghost" onClick={() => setIsRenaming(false)}>Cancel</Button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 group">
                                <h3 className="font-semibold text-lg">{title}</h3>
                                {isEditing && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => setIsRenaming(true)}
                                    >
                                        <Pencil className="h-3 w-3" />
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>

                    {isEditing && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setIsRenaming(true)}>
                                    <Pencil className="mr-2 h-4 w-4" /> Rename
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive" onClick={() => onDelete(id)}>
                                    <Trash className="mr-2 h-4 w-4" /> Delete Section
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>

                <CollapsibleContent>
                    <div className="p-4 pt-0 space-y-1">
                        {items.length === 0 && subsections.length === 0 ? (
                            <div className="py-6 text-center text-muted-foreground text-sm italic border-t border-dashed">
                                No content in this section
                            </div>
                        ) : (
                            <div className="space-y-2 mt-2">
                                {items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center p-3 rounded-md hover:bg-muted/50 group border border-transparent hover:border-border transition-colors"
                                    >
                                        <div className="mr-3 mt-0.5">
                                            {getItemIcon(item.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <a href={item.url || '#'} className="font-medium hover:underline truncate block">
                                                    {item.title}
                                                </a>
                                                {item.completed && (
                                                    <Badge variant="secondary" className="text-xs h-5 px-1.5 bg-green-100 text-green-800 hover:bg-green-100">
                                                        Done
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                                                <span className="capitalize">{item.type}</span>
                                                {item.duration && <span>• {item.duration} min</span>}
                                                {item.dueDate && <span>• Due: {new Date(item.dueDate).toLocaleDateString()}</span>}
                                            </div>
                                        </div>

                                        {isEditing && (
                                            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                {item.type === 'file' && item.video_url && (
                                                    <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                                                        <a href={item.video_url} target="_blank" rel="noopener noreferrer" title="Download">
                                                            <Download className="h-4 w-4" />
                                                        </a>
                                                    </Button>
                                                )}
                                                {onEditItem && (
                                                    <Button variant="ghost" size="sm" onClick={() => onEditItem(item)} className="h-8 w-8 p-0">
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => onEditItem(item)}>
                                                            <Pencil className="mr-2 h-4 w-4" /> Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="text-destructive" onClick={() => onDeleteItem(id, item.id, item.type)}>
                                                            <Trash className="mr-2 h-4 w-4" /> Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {/* Render Subsections */}
                                {subsections.length > 0 && (
                                    <div className="ml-6 border-l-2 border-muted pl-4 mt-4 space-y-4">
                                        {subsections.map(sub => (
                                            <CourseSection
                                                key={sub.id}
                                                id={sub.id}
                                                title={sub.title}
                                                items={sub.items}
                                                subsections={sub.subsections}
                                                isEditing={isEditing}
                                                onRename={onRename}
                                                onDelete={onDelete}
                                                onAddItem={onAddItem}
                                                onDeleteItem={onDeleteItem}
                                                onEditItem={onEditItem}
                                                // Recursive props
                                                onAddSubsection={onAddSubsection}
                                            // Note: Drag and drop for subsections is not fully wired up in parent
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {isEditing && (
                            <div className="flex justify-center mt-4 pt-2 border-t border-dashed">
                                <ActivityChooser
                                    onAddActivity={(type) => onAddItem(id, type)}
                                    onAddSubsection={handleAddSubsection}
                                />
                            </div>
                        )}
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </div>
    );
}
