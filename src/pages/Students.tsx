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
import {useQuery} from "@tanstack/react-query"
import {getStudents} from "../api/admin.api"
// import { useParams } from 'react-router-dom'

interface Student {
  id: string;
  fullName: string;
  matricule: string;
  score: number;
}

// Backend response type
interface BackendStudent {
  _id: string;
  name: string;
  matricule: string;
  score: number;
  level: string;
  createdAt: string;
  __v: number;
}

const columnHelper = createColumnHelper<Student>();

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
          info.getValue() >= 75 ? 'text-green-400' : 'text-red-400'
        }`}>
          {info.getValue()}%
        </span>
      </div>
    ),
  }),
];

function Students() {
  const [sorting, setSorting] = useState<SortingState>([])
  const { darkMode } = useTheme();
  const currentUrl: string = window.location.href; // Full current URL
  const urlSegments: string[] = currentUrl.split("/");
  const classLevel = urlSegments[urlSegments.length - 1];

  console.log("classLevel:",classLevel)
  
  const { data: studentsData = [], isLoading } = useQuery({
    queryKey: ["students", classLevel],
    queryFn: () => getStudents(classLevel || ''),
    enabled: !!classLevel
  });

  console.log("Students data:",studentsData)

  // Map backend data to expected format
  const data = useMemo(() => {
    if (!Array.isArray(studentsData)) return [];
    return studentsData.map((student: BackendStudent) => ({
      id: student._id,
      fullName: student.name,
      matricule: student.matricule,
      score: student.score,
    }));
  }, [studentsData]);
  console.log("Data:",data)

  // Calculate statistics from real data
  const totalStudents = data.length;
  const highestScore = Math.max(...data.map((s: Student) => s.score));
  const passThreshold = 75;
  const passCount = data.filter((s: Student) => s.score >= passThreshold).length;
  const passPercentage = totalStudents > 0 ? (passCount / totalStudents) * 100 : 0;

  const donutData = [
    { name: 'Pass', value: passCount, color: '#22c55e' },
    { name: 'Fail', value: totalStudents - passCount, color: '#ef4444' },
  ];

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
    const exportData = data.map((student: Student) => ({
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

  if (isLoading) {
    return (
      <Layout>
        <div className="p-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Layout>
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Students</h1>
              <p className="text-gray-400">{classLevel}</p>
            </div>
          </div>
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-8 shadow-lg`}>
            <div className="text-center">
              <PiStudent className={`mx-auto h-12 w-12 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
              <h3 className={`mt-4 text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                No students found
              </h3>
              <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                There are no students registered for {classLevel} yet.
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Students</h1>
            <p className="text-gray-400">{classLevel}</p>
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
