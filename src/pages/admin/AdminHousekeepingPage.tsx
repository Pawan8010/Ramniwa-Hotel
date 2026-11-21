import React, { useState } from 'react';
import { CheckCircle2, Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/DataState';
import { InputField, SelectField, TextareaField } from '../../components/ui/FormField';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { useHotelData } from '../../hooks/useRepository';
import { useToast } from '../../hooks/useToast';
import type { HousekeepingTask, TaskStatus } from '../../types/hotel';

export function AdminHousekeepingPage() {
  useDocumentMeta('Housekeeping Queue · Hotel Ramniwas Admin', 'Auto-created checkout cleaning tasks and room release workflow.');

  const { state, repo } = useHotelData();
  const { showToast } = useToast();

  const [roomNumber, setRoomNumber] = useState(state.roomUnits[0]?.roomNumber ?? '101');
  const [taskType, setTaskType] = useState<HousekeepingTask['taskType']>('Deep Clean');
  const [assignedTo, setAssignedTo] = useState('Savita Tai');
  const [notes, setNotes] = useState('');

  const handleStatusUpdate = (task: HousekeepingTask, status: TaskStatus) => {
    repo.updateHousekeepingStatus(task.id, status);
    showToast({
      tone: 'success',
      title: `Room ${task.roomNumber} task → ${status}`,
      description: status === 'Done' ? `Room ${task.roomNumber} is now marked Available.` : undefined,
    });
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    const unit = state.roomUnits.find((u) => u.roomNumber === roomNumber);
    repo.createHousekeepingTask({
      roomNumber,
      floor: unit?.floor ?? 1,
      taskType,
      status: 'Pending',
      assignedTo: assignedTo.trim() || 'Floor Attendant',
      notes: notes.trim() || 'Scheduled housekeeping inspection',
    });
    setNotes('');
    showToast({ tone: 'success', title: `Housekeeping task created for Room ${roomNumber}` });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-text-primary">
          Housekeeping & Room Turnover
        </h1>
        <p className="text-sm text-text-secondary">
          Tasks are automatically queued when a booking moves to Checked-out. Marking a task Done sets the room back to Available.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-3">
          {state.housekeeping.length === 0 ? (
            <EmptyState
              title="No housekeeping tasks queued"
              description="All 32 rooms are inspected and ready."
            />
          ) : (
            state.housekeeping.map((task) => (
              <div
                key={task.id}
                className="p-4 sm:p-5 rounded-xl bg-surface-raised border border-border-subtle shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <span className="font-bold text-text-primary">Room {task.roomNumber}</span>
                    <span aria-hidden="true">·</span>
                    <span>Floor {task.floor}</span>
                    <span aria-hidden="true">·</span>
                    <span>{task.taskType}</span>
                  </div>
                  <p className="text-sm font-medium text-text-primary mt-1">{task.notes}</p>
                  <p className="text-xs text-text-secondary mt-1">Assigned: {task.assignedTo}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {task.status !== 'Done' ? (
                    <>
                      {task.status === 'Pending' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleStatusUpdate(task, 'In Progress')}
                        >
                          Start
                        </Button>
                      )}
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleStatusUpdate(task, 'Done')}
                      >
                        <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                        Mark Done
                      </Button>
                    </>
                  ) : (
                    <span className="text-xs font-semibold text-status-success">Completed</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <form
          onSubmit={handleCreateTask}
          className="lg:col-span-4 p-6 rounded-2xl bg-surface-raised border border-border-subtle shadow-card space-y-4"
        >
          <h2 className="font-display text-xl font-semibold text-text-primary">
            Add Housekeeping Task
          </h2>
          <SelectField
            label="Room Number"
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
          >
            {state.roomUnits.map((u) => (
              <option key={u.roomNumber} value={u.roomNumber}>
                Room {u.roomNumber} (Floor {u.floor})
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Task Type"
            value={taskType}
            onChange={(e) => setTaskType(e.target.value as HousekeepingTask['taskType'])}
          >
            <option value="Checkout Cleaning">Checkout Cleaning</option>
            <option value="Deep Clean">Deep Clean</option>
            <option value="Linen Refresh">Linen Refresh</option>
            <option value="Maintenance">Maintenance</option>
          </SelectField>
          <InputField
            label="Assigned Staff"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
          />
          <TextareaField
            label="Instructions"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Sanitize washroom and replace towels..."
          />
          <Button type="submit" variant="primary" className="w-full">
            <Plus className="w-4 h-4" aria-hidden="true" />
            Queue Task
          </Button>
        </form>
      </div>
    </div>
  );
}
