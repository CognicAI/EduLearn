import React, { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';

interface Teacher {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
}

interface TeacherSelectorProps {
    selectedTeacherIds: string[];
    onSelectionChange: (teacherIds: string[]) => void;
    excludeTeacherIds?: string[]; // Teachers to exclude (e.g., course instructor)
}

export function TeacherSelector({
    selectedTeacherIds,
    onSelectionChange,
    excludeTeacherIds = []
}: TeacherSelectorProps) {
    const [open, setOpen] = useState(false);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');

    useEffect(() => {
        // Load teachers
        const loadTeachers = async () => {
            setLoading(true);
            try {
                const { getTeachers } = await import('@/lib/services/courseAssignments');
                const data = await getTeachers();
                // Filter out excluded teachers
                const filtered = data.filter(t => !excludeTeacherIds.includes(t.id));
                setTeachers(filtered);
            } catch (error) {
                console.error('Failed to load teachers:', error);
            } finally {
                setLoading(false);
            }
        };
        loadTeachers();
    }, [excludeTeacherIds]);

    const toggleTeacher = (teacherId: string) => {
        if (selectedTeacherIds.includes(teacherId)) {
            onSelectionChange(selectedTeacherIds.filter(id => id !== teacherId));
        } else {
            onSelectionChange([...selectedTeacherIds, teacherId]);
        }
    };

    const selectedTeachers = teachers.filter(t => selectedTeacherIds.includes(t.id));

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    {selectedTeachers.length === 0 && 'Select teachers...'}
                    {selectedTeachers.length === 1 && `${selectedTeachers[0].first_name} ${selectedTeachers[0].last_name}`}
                    {selectedTeachers.length > 1 && `${selectedTeachers.length} teachers selected`}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
                <Command>
                    <CommandInput
                        placeholder="Search teachers..."
                        value={search}
                        onValueChange={setSearch}
                    />
                    <CommandEmpty>
                        {loading ? (
                            <div className="flex items-center justify-center py-6">
                                <Loader2 className="h-4 w-4 animate-spin" />
                            </div>
                        ) : (
                            'No teachers found.'
                        )}
                    </CommandEmpty>
                    <CommandGroup className="max-h-64 overflow-auto">
                        {teachers.map((teacher) => (
                            <CommandItem
                                key={teacher.id}
                                onSelect={() => toggleTeacher(teacher.id)}
                                className="flex items-center gap-2"
                            >
                                <Checkbox
                                    checked={selectedTeacherIds.includes(teacher.id)}
                                    onCheckedChange={() => toggleTeacher(teacher.id)}
                                />
                                <div className="flex flex-col">
                                    <span className="font-medium">
                                        {teacher.first_name} {teacher.last_name}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                        {teacher.email}
                                    </span>
                                </div>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
