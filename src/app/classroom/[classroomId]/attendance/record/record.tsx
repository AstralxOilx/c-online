
'use client';

import * as React from "react";
import { LoaderCircle } from 'lucide-react';
import { useClassroomId } from '@/hooks/use-classroom-id';
import { useGetAttendanceForClassroom } from '@/features/attendances/api/use-get-attendacne-for-classroom';
import { Button } from '@/components/ui/button'; // ใช้ Button จาก ShadCN
import { useRouter } from "next/navigation";

function AttendanceRecordTable() {
    const classroomId = useClassroomId();
    const router = useRouter();
    const { data: getAttendanceForClassroom, isLoading: loadingAttendanceForClassroom } = useGetAttendanceForClassroom({ classroomId });

    const [searchQuery, setSearchQuery] = React.useState("");
    const [currentPage, setCurrentPage] = React.useState(1);
    const recordsPerPage = 30;

    if (loadingAttendanceForClassroom ) {
        return (
            <div className="h-full flex-1 flex justify-center items-center flex-col gap-2">
                <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if(!classroomId || !getAttendanceForClassroom){
        router.replace('/classroom');
        return;
    }

    const filteredStudents = getAttendanceForClassroom.students.filter(student =>
        `${student.studentFname} ${student.studentLname}`.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = filteredStudents.slice(indexOfFirstRecord, indexOfLastRecord);

    const totalPages = Math.ceil(filteredStudents.length / recordsPerPage);

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    return (
        <div className="container mx-auto px-4 py-6 bg-gradient-to-r from-blue-50/90 to-purple-50/50 rounded-sm shadow-lg"> 
            <div className="mb-6 flex justify-center">
                <input
                    type="text"
                    placeholder="ค้นหาชื่อนักเรียน"
                    className="border-2 border-primary rounded-lg p-2 w-full max-w-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {getAttendanceForClassroom.attendanceData.length > 0 && (
                <div className="overflow-x-auto bg-white rounded-sm shadow-lg">
                    <table className="min-w-full bg-white">
                        <thead className="bg-primary">
                            <tr>
                                <th className="py-4 px-6 text-left text-sm font-medium text-white border-b">ชื่อ-นามสกุล</th>
                                {getAttendanceForClassroom.attendanceData.map((session) => (
                                    <th
                                        key={session.sessionId}
                                        className="py-4 px-6 text-left text-sm font-medium text-white border-b"
                                    >
                                        {session.sessionTitle}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {currentRecords.map((student) => (
                                <tr key={student.userId} className="hover:bg-indigo-50">
                                    <td className="py-3 px-6 text-sm text-gray-700 border-b">
                                        {`${student.studentFname} ${student.studentLname}`}
                                    </td>
                                    {getAttendanceForClassroom.attendanceData.map((session) => {
                                        const attRecord = session.attendanceRecords.find(
                                            (att) => att.userId === student.userId
                                        );
                                        return (
                                            <td
                                                key={session.sessionId}
                                                className="py-3 px-6 text-sm text-gray-700 border-b"
                                            >
                                                {attRecord ? (
                                                    attRecord.status === "present" ? "มา" :
                                                        attRecord.status === "absent" ? "ขาด" :
                                                            attRecord.status === "leave" ? "ลา" :
                                                                attRecord.status === "late" ? "สาย" :
                                                                    "N/A"
                                                ) : "ขาด"}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-6">
                <Button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    variant="outline"
                    className="text-primary border-primary hover:bg-indigo-100"
                >
                    ย้อนกลับ
                </Button>
                <span className="text-lg text-primary">หน้า {currentPage} จาก {totalPages}</span>
                <Button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    className="text-primary border-primary hover:bg-indigo-100"
                >
                    ถัดไป
                </Button>
            </div>
        </div>
    );
}

export default AttendanceRecordTable;

