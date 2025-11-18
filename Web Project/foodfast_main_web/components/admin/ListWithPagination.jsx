'use client'
import { useState, useMemo } from 'react'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'

export default function ListWithPagination({ items, columns, title, searchFields = [] }) {
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10

    const filteredItems = useMemo(() => {
        if (!searchTerm.trim()) return items

        return items.filter(item =>
            searchFields.some(field => {
                const value = field.split('.').reduce((obj, key) => obj?.[key], item)
                return value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
            })
        )
    }, [items, searchTerm, searchFields])

    const totalPages = Math.ceil(filteredItems.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentItems = filteredItems.slice(startIndex, endIndex)

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1)
        }
    }

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1)
        }
    }

    const handlePageChange = (pageNum) => {
        setCurrentPage(pageNum)
    }

    const renderCellValue = (value) => {
        if (value === null || value === undefined) return '-'
        if (typeof value === 'boolean') return value ? 'Yes' : 'No'
        if (Array.isArray(value)) return value.length > 0 ? value.join(', ') : '-'
        if (typeof value === 'object') {
            if (value.latitude !== undefined && value.longitude !== undefined) {
                return `${value.latitude.toFixed(4)}, ${value.longitude.toFixed(4)}`
            }
            return JSON.stringify(value)
        }
        return value.toString()
    }

    return (
        <div className="text-slate-500">
            <h2 className="text-2xl mb-6">
                {title} <span className="text-slate-800 font-medium">({filteredItems.length})</span>
            </h2>

            <div className="mb-6 flex items-center gap-3 bg-white border border-slate-200 rounded-lg p-3 max-w-md">
                <Search size={18} className="text-slate-400" />
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value)
                        setCurrentPage(1)
                    }}
                    className="flex-1 outline-none bg-transparent text-slate-700"
                />
            </div>

            {currentItems.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                    <p className="text-lg">{searchTerm ? 'No results found' : 'No items found'}</p>
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto rounded-lg border border-slate-200">
                        <table className="min-w-full bg-white text-sm">
                            <thead className="bg-slate-50 sticky top-0">
                                <tr>
                                    {columns.map((col) => (
                                        <th key={col.key} className="py-3 px-4 text-left font-semibold text-slate-600">
                                            {col.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {currentItems.map((item, idx) => (
                                    <tr key={item.id || idx} className="hover:bg-slate-50">
                                        {columns.map((col) => (
                                            <td key={`${item.id}-${col.key}`} className="py-3 px-4 text-slate-700">
                                                {col.render
                                                    ? col.render(item)
                                                    : renderCellValue(col.key.split('.').reduce((obj, key) => obj?.[key], item))
                                                }
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-6">
                            <p className="text-sm text-slate-600">
                                Showing {startIndex + 1} to {Math.min(endIndex, filteredItems.length)} of {filteredItems.length} items
                            </p>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handlePreviousPage}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    <ChevronLeft size={18} />
                                </button>

                                <div className="flex gap-1">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                                        <button
                                            key={pageNum}
                                            onClick={() => handlePageChange(pageNum)}
                                            className={`px-3 py-1 rounded text-sm transition ${currentPage === pageNum ? 'bg-slate-700 text-white' : 'border border-slate-200 hover:bg-slate-50'}`}
                                        >
                                            {pageNum}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={handleNextPage}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
