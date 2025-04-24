import { useState, useMemo } from 'react'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  getPaginationRowModel,
} from '@tanstack/react-table'
import { PiStudent, PiTrophy } from 'react-icons/pi'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { HiDownload } from 'react-icons/hi'
import * as XLSX from 'xlsx'
import Layout from '../components/Layout'
import { useTheme } from '../context/ThemeContext'

// Mock data
const mockStudents = [
  { id: 1, fullName: "John Doe", matricule: "2024001", score: 85 },
  { id: 2, fullName: "Jane Smith", matricule: "2024002", score: 92 },
  { id: 3, fullName: "Michael Johnson", matricule: "2024003", score: 78 },
  { id: 4, fullName: "Sarah Williams", matricule: "2024004", score: 95 },
  { id: 5, fullName: "Robert Brown", matricule: "2024005", score: 88 },
  { id: 6, fullName: "Emily Davis", matricule: "2024006", score: 73 },
  { id: 7, fullName: "William Miller", matricule: "2024007", score: 82 },
  { id: 8, fullName: "Emma Wilson", matricule: "2024008", score: 90 },
  { id: 9, fullName: "James Taylor", matricule: "2024009", score: 68 },
  { id: 10, fullName: "Olivia Anderson", matricule: "2024010", score: 87 },
];

// Calculate statistics
const totalStudents = mockStudents.length;
const highestScore = Math.max(...mockStudents.map(s => s.score));
const passThreshold = 75;
const passCount = mockStudents.filter(s => s.score >= passThreshold).length;
const passPercentage = (passCount / totalStudents) * 100;

const columnHelper = createColumnHelper<typeof mockStudents[0]>();

const columns = [
  columnHelper.accessor('matricule', {
    header: 'Matricule',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('fullName', {
    header: 'Full Name',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('score', {
    header: 'Score',
    cell: info => (
      <div className="flex items-center">
        <span className={`${
          info.getValue() >= passThreshold ? 'text-green-400' : 'text-red-400'
        }`}>
          {info.getValue()}%
        </span>
      </div>
    ),
  }),
];

const donutData = [
  { name: 'Pass', value: passCount, color: '#22c55e' },
  { name: 'Fail', value: totalStudents - passCount, color: '#ef4444' },
];

function Students() {
  const [sorting, setSorting] = useState<SortingState>([])
  const { darkMode } = useTheme();
  const data = useMemo(() => mockStudents, [])

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const handleExportToExcel = () => {
    // Prepare data for export
    const exportData = data.map(student => ({
      Matricule: student.matricule,
      Name: student.fullName,
      Score: `${student.score}%`
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");

    // Generate Excel file
    XLSX.writeFile(wb, "students_list.xlsx");
  };

  return (
    <Layout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Students</h1>
            <p className="text-gray-400">Form 1</p>
          </div>
          <button
            onClick={handleExportToExcel}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <HiDownload className="text-lg" />
            <span>Export to Excel</span>
          </button>
        </div>

        {/* Stats Cards and Chart */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-600 rounded-xl p-6 text-white">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-4xl font-bold mb-2">{totalStudents}</h3>
                <p>Total Students</p>
              </div>
              <PiStudent className="text-4xl opacity-80" />
            </div>
          </div>

          <div className="bg-blue-500 rounded-xl p-6 text-white">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-4xl font-bold mb-2">{highestScore}%</h3>
                <p>Highest Score</p>
              </div>
              <PiTrophy className="text-4xl opacity-80" />
            </div>
          </div>

          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6`}>
            <div className="flex items-center justify-between h-full">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Pass Rate</h3>
                <p className="text-4xl font-bold text-green-400">{Math.round(passPercentage)}%</p>
              </div>
              <div className="h-24 w-24">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      innerRadius={25}
                      outerRadius={40}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {donutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th
                        key={header.id}
                        className="text-left p-3 text-gray-400 border-b border-gray-700"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div className="flex items-center space-x-2 cursor-pointer">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          <span>
                            {{ asc: ' 🔼', desc: ' 🔽' }[
                              header.column.getIsSorted() as string
                            ] ?? null}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map(row => (
                  <tr
                    key={row.id}
                    className="border-b border-gray-700 hover:bg-gray-800/50"
                  >
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="p-3 text-gray-300">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4 text-gray-400">
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-1 rounded hover:bg-gray-700"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                {'<<'}
              </button>
              <button
                className="px-3 py-1 rounded hover:bg-gray-700"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                {'<'}
              </button>
              <button
                className="px-3 py-1 rounded hover:bg-gray-700"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                {'>'}
              </button>
              <button
                className="px-3 py-1 rounded hover:bg-gray-700"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                {'>>'}
              </button>
            </div>
            <span className="flex items-center gap-1">
              <div>Page</div>
              <strong>
                {table.getState().pagination.pageIndex + 1} of{' '}
                {table.getPageCount()}
              </strong>
            </span>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Students
