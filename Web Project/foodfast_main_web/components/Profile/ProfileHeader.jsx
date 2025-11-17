'use client'

export default function ProfileHeader({
    user,
    isEditing,
    onEdit,
    onCancel,
    onSave,
    isSaving
}) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
                <h2 className="text-lg sm:text-xl font-medium text-black mb-1">
                    {user?.name || 'User'}
                </h2>
                <p className="text-sm sm:text-base text-black opacity-50">
                    {user?.email}
                </p>
            </div>

            {isEditing ? (
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onSave}
                        disabled={isSaving}
                        className="px-6 py-3 rounded-lg bg-[#366055] text-white font-medium hover:bg-[#2b4c44] transition-colors disabled:opacity-50"
                    >
                        {isSaving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            ) : (
                <button
                    onClick={onEdit}
                    className="px-6 py-3 rounded-lg bg-[#366055] text-white font-medium hover:bg-[#2b4c44] transition-colors self-start sm:self-auto"
                >
                    Edit
                </button>
            )}
        </div>
    )
}
