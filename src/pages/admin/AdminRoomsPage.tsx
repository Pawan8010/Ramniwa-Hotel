import React, { useState } from 'react';
import { Edit3, Plus, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { InputField, SelectField, TextareaField } from '../../components/ui/FormField';
import { Modal } from '../../components/ui/Modal';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { useHotelData } from '../../hooks/useRepository';
import { useToast } from '../../hooks/useToast';
import type { RoomType, RoomUnit, RoomUnitStatus } from '../../types/hotel';
import { formatInr } from '../../utils/validators';

const STATUS_STYLE: Record<RoomUnitStatus, string> = {
  Available: 'bg-status-success/12 border-status-success/40 text-status-success',
  Occupied: 'bg-action-primary/12 border-action-primary/40 text-action-primary',
  Cleaning: 'bg-status-warning/15 border-status-warning/40 text-status-warning',
  Maintenance: 'bg-status-error/12 border-status-error/40 text-status-error',
};

export function AdminRoomsPage() {
  useDocumentMeta('Rooms & 32-Room Floor Grid · Hotel Ramniwas Admin', 'Manage room categories, tariffs, and 4-floor 32-room status.');

  const { state, repo } = useHotelData();
  const { showToast } = useToast();

  const [editingUnit, setEditingUnit] = useState<RoomUnit | null>(null);
  const [unitStatus, setUnitStatus] = useState<RoomUnitStatus>('Available');
  const [unitNotes, setUnitNotes] = useState('');

  const [editingType, setEditingType] = useState<RoomType | null>(null);

  const floors = [4, 3, 2, 1] as const;
  const typeMap = new Map(state.roomTypes.map((r) => [r.id, r.shortName]));

  const openUnitModal = (unit: RoomUnit) => {
    setEditingUnit(unit);
    setUnitStatus(unit.status);
    setUnitNotes(unit.notes ?? '');
  };

  const handleSaveUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUnit) return;
    repo.updateRoomUnitStatus(editingUnit.roomNumber, unitStatus, unitNotes);
    showToast({
      tone: 'success',
      title: `Room ${editingUnit.roomNumber} marked ${unitStatus}`,
    });
    setEditingUnit(null);
  };

  const handleSaveRoomType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingType) return;
    repo.saveRoomType(editingType);
    showToast({ tone: 'success', title: `Saved ${editingType.name}` });
    setEditingType(null);
  };

  const handleCreateRoomType = () => {
    setEditingType({
      id: `rt-custom-${Date.now()}`,
      slug: 'ac-king',
      name: 'New Room Category',
      shortName: 'New Room',
      filterGroup: 'AC Deluxe',
      areaSqFt: 140,
      bedConfig: '1 Queen Bed',
      maxGuests: 2,
      baseRate: 2100,
      minTariff: 1900,
      maxTariff: 2600,
      totalInventory: 2,
      amenities: ['Air Conditioning', 'Wi-Fi', '24h Hot Water', 'LED TV'],
      description: 'Comfortable room category at Hotel Ramniwas.',
      imageSlots: ['room-ac-king-1'],
    });
  };

  const handleDeleteRoomType = (rt: RoomType) => {
    const ok = repo.deleteRoomType(rt.id);
    if (!ok) {
      showToast({
        tone: 'error',
        title: 'Cannot delete room category',
        description: 'Active confirmed or checked-in bookings exist for this room type.',
      });
      return;
    }
    showToast({ tone: 'info', title: `${rt.name} removed` });
  };

  return (
    <div className="space-y-10">
      {/* Room Categories */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-text-primary">
              Room Categories & Tariffs
            </h1>
            <p className="text-sm text-text-secondary">
              Edit base rates, seasonal bounds, and room counts across categories.
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={handleCreateRoomType}>
            <Plus className="w-4 h-4" aria-hidden="true" />
            Add Room Category
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {state.roomTypes.map((rt) => (
            <div
              key={rt.id}
              className="p-5 rounded-xl bg-surface-raised border border-border-subtle shadow-card flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs text-text-secondary">{rt.filterGroup} · {rt.areaSqFt} sq ft</p>
                    <h2 className="font-display text-xl font-semibold text-text-primary">{rt.name}</h2>
                  </div>
                  <span className="font-ui font-bold text-action-primary tabular-nums">
                    {formatInr(rt.baseRate)}/nt
                  </span>
                </div>
                <p className="text-xs text-text-secondary mt-2 tabular-nums">
                  Inventory: {rt.totalInventory} units · Range {formatInr(rt.minTariff)}–{formatInr(rt.maxTariff)}
                </p>
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-subtle">
                <Button variant="secondary" size="sm" onClick={() => setEditingType({ ...rt })}>
                  <Edit3 className="w-3.5 h-3.5" aria-hidden="true" /> Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteRoomType(rt)}>
                  <Trash2 className="w-3.5 h-3.5 text-status-error" aria-hidden="true" />
                  <span className="sr-only">Delete {rt.name}</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4-Floor 32-Room Grid */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-text-primary">
              4-Floor Property Grid (32 Rooms)
            </h2>
            <p className="text-sm text-text-secondary">
              Select any room tile to update live operational status (Available, Occupied, Cleaning, Maintenance).
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-xs font-medium">
            {(['Available', 'Occupied', 'Cleaning', 'Maintenance'] as const).map((s) => (
              <span key={s} className={`px-2.5 py-1 rounded border ${STATUS_STYLE[s]}`}>
                {s}: {state.roomUnits.filter((u) => u.status === s).length}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {floors.map((floor) => {
            const units = state.roomUnits.filter((u) => u.floor === floor);
            return (
              <div
                key={floor}
                className="p-4 rounded-xl bg-surface-raised border border-border-subtle shadow-card"
              >
                <h3 className="text-sm font-semibold text-text-primary mb-3">
                  Floor {floor} ({units.length} Rooms)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
                  {units.map((unit) => (
                    <button
                      key={unit.roomNumber}
                      type="button"
                      onClick={() => openUnitModal(unit)}
                      className={`p-3 rounded-lg border text-left cursor-pointer transition-transform hover:scale-[1.02] ${STATUS_STYLE[unit.status]}`}
                    >
                      <p className="font-ui text-base font-bold tabular-nums">{unit.roomNumber}</p>
                      <p className="text-[11px] font-semibold mt-0.5">{unit.status}</p>
                      <p className="text-[11px] opacity-85 truncate mt-0.5">
                        {typeMap.get(unit.roomTypeId) ?? 'Room'}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Edit Unit Modal */}
      <Modal
        isOpen={Boolean(editingUnit)}
        onClose={() => setEditingUnit(null)}
        title={editingUnit ? `Room ${editingUnit.roomNumber} Status` : 'Room Status'}
      >
        <form onSubmit={handleSaveUnit} className="space-y-4">
          <SelectField
            label="Operational Status"
            value={unitStatus}
            onChange={(e) => setUnitStatus(e.target.value as RoomUnitStatus)}
          >
            <option value="Available">Available</option>
            <option value="Occupied">Occupied</option>
            <option value="Cleaning">Cleaning</option>
            <option value="Maintenance">Maintenance</option>
          </SelectField>
          <TextareaField
            label="Staff Notes"
            value={unitNotes}
            onChange={(e) => setUnitNotes(e.target.value)}
            placeholder="e.g. AC servicing completed, fresh linen..."
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setEditingUnit(null)}>Cancel</Button>
            <Button type="submit" variant="primary">Save Room Status</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Room Type Modal */}
      <Modal
        isOpen={Boolean(editingType)}
        onClose={() => setEditingType(null)}
        title="Edit Room Category"
      >
        {editingType && (
          <form onSubmit={handleSaveRoomType} className="space-y-4">
            <InputField
              label="Category Name"
              required
              value={editingType.name}
              onChange={(e) => setEditingType({ ...editingType, name: e.target.value })}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InputField
                label="Base Nightly Rate (INR)"
                type="number"
                required
                value={String(editingType.baseRate)}
                onChange={(e) =>
                  setEditingType({ ...editingType, baseRate: Number(e.target.value) || 0 })
                }
              />
              <InputField
                label="Total Inventory Count"
                type="number"
                required
                value={String(editingType.totalInventory)}
                onChange={(e) =>
                  setEditingType({ ...editingType, totalInventory: Number(e.target.value) || 1 })
                }
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InputField
                label="Min Seasonal Tariff"
                type="number"
                value={String(editingType.minTariff)}
                onChange={(e) =>
                  setEditingType({ ...editingType, minTariff: Number(e.target.value) || 0 })
                }
              />
              <InputField
                label="Max Seasonal Tariff"
                type="number"
                value={String(editingType.maxTariff)}
                onChange={(e) =>
                  setEditingType({ ...editingType, maxTariff: Number(e.target.value) || 0 })
                }
              />
            </div>
            <TextareaField
              label="Description"
              value={editingType.description}
              onChange={(e) => setEditingType({ ...editingType, description: e.target.value })}
            />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setEditingType(null)}>Cancel</Button>
              <Button type="submit" variant="primary">Save Category</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
