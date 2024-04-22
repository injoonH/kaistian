export function padKaistUid(kaistUid: number): string {
  return kaistUid.toString().padStart(8, '0')
}

export function padStudentId(studentId: number): string {
  return studentId.toString().padStart(9, '0')
}
