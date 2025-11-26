import React, { useState, useEffect } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CourseSection, CourseItem } from './CourseSection';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Layers } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export interface Module {
    id: string;
    title: string;
    items: CourseItem[];
    subsections?: Module[];
    sortOrder: number;
}

interface CourseStructureProps {
    modules: Module[];
    isEditing: boolean;
    onModulesChange: (newModules: Module[]) => void;
    onAddModule: (title: string) => void;
    onDeleteModule: (moduleId: string) => void;
    onRenameModule: (moduleId: string, newTitle: string) => void;
    onAddItem: (moduleId: string, type: string) => void;
    onDeleteItem: (moduleId: string, itemId: string, type: string) => void;
    onEditItem: (item: CourseItem) => void;
    onBulkAddModules: (count: number) => void;
    onAddSubsection: (parentId: string, title: string) => void;
}

export function CourseStructure({
    modules,
    isEditing,
    onModulesChange,
    onAddModule,
    onDeleteModule,
    onRenameModule,
    onAddItem,
    onDeleteItem,
    onEditItem,
    onBulkAddModules,
    onAddSubsection
}: CourseStructureProps) {
    const [activeModules, setActiveModules] = useState<Module[]>(modules);
    const [isBulkAddOpen, setIsBulkAddOpen] = useState(false);
    const [bulkCount, setBulkCount] = useState(1);
    const [openSections, setOpenSections] = useState<string[]>([]);

    useEffect(() => {
        setActiveModules(modules);
        // Default to collapsed state (empty openSections)
        // If we wanted to preserve state across re-renders, we'd need more logic,
        // but for now, "collapsed by default" means we don't auto-populate openSections.
    }, [modules]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = activeModules.findIndex((m) => m.id === active.id);
            const newIndex = activeModules.findIndex((m) => m.id === over.id);

            const newModules = arrayMove(activeModules, oldIndex, newIndex);
            setActiveModules(newModules);
            onModulesChange(newModules);
        }
    };

    const handleBulkAdd = () => {
        onBulkAddModules(bulkCount);
        setIsBulkAddOpen(false);
        setBulkCount(1);
    };

    const toggleSection = (id: string, isOpen: boolean) => {
        setOpenSections(prev =>
            isOpen ? [...prev, id] : prev.filter(i => i !== id)
        );
    };

    const expandAll = () => {
        setOpenSections(activeModules.map(m => m.id));
    };

    const collapseAll = () => {
        setOpenSections([]);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-end items-center mb-4 gap-2">
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={expandAll}>Expand All</Button>
                    <Button variant="outline" size="sm" onClick={collapseAll}>Collapse All</Button>
                </div>
                {isEditing && (
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setIsBulkAddOpen(true)}>
                            <Layers className="mr-2 h-4 w-4" />
                            Bulk Add Sections
                        </Button>
                    </div>
                )}
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={activeModules.map(m => m.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-4">
                        {activeModules.map((module) => (
                            <CourseSection
                                key={module.id}
                                id={module.id}
                                title={module.title}
                                items={module.items}
                                subsections={module.subsections}
                                isEditing={isEditing}
                                onRename={onRenameModule}
                                onDelete={onDeleteModule}
                                onAddItem={onAddItem}
                                onDeleteItem={onDeleteItem}
                                onEditItem={onEditItem}
                                isOpen={openSections.includes(module.id)}
                                onOpenChange={(isOpen) => toggleSection(module.id, isOpen)}
                                onAddSubsection={onAddSubsection}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            {isEditing && (
                <div className="border-2 border-dashed border-muted rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => onAddModule("New Section")}
                >
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-3 text-primary">
                        <Plus className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-lg">Add Section</h3>
                    <p className="text-sm text-muted-foreground mt-1">Create a new module to organize your content</p>
                </div>
            )}

            <Dialog open={isBulkAddOpen} onOpenChange={setIsBulkAddOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Bulk Add Sections</DialogTitle>
                        <DialogDescription>
                            Quickly create multiple sections at once.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="count">Number of sections to add</Label>
                        <Input
                            id="count"
                            type="number"
                            min={1}
                            max={20}
                            value={bulkCount}
                            onChange={(e) => setBulkCount(parseInt(e.target.value) || 1)}
                            className="mt-2"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsBulkAddOpen(false)}>Cancel</Button>
                        <Button onClick={handleBulkAdd}>Add {bulkCount} Sections</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
