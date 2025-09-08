import jsPDF from 'jspdf';

interface PrescriptionData {
  id: string;
  patient_name: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  special_instructions: string;
  prescribed_date: string;
  doctor_name: string;
}

export const generatePrescriptionPDF = (prescription: PrescriptionData) => {
  const pdf = new jsPDF();
  
  // Header
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('PRESCRIPTION', 105, 30, { align: 'center' });
  
  // Doctor/Clinic Information
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text('DoctorConnect Healthcare', 20, 50);
  pdf.text(`Dr. ${prescription.doctor_name}`, 20, 60);
  pdf.text('Medical Practitioner', 20, 70);
  
  // Date
  pdf.text(`Date: ${new Date(prescription.prescribed_date).toLocaleDateString()}`, 140, 50);
  
  // Patient Information
  pdf.setFont('helvetica', 'bold');
  pdf.text('Patient Information:', 20, 90);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Name: ${prescription.patient_name}`, 20, 100);
  
  // Prescription Details
  pdf.setFont('helvetica', 'bold');
  pdf.text('Prescription Details:', 20, 120);
  
  pdf.setFont('helvetica', 'normal');
  let yPosition = 130;
  
  // Medication box
  pdf.rect(20, yPosition - 5, 170, 40);
  pdf.text(`Medication: ${prescription.medication_name}`, 25, yPosition + 5);
  pdf.text(`Dosage: ${prescription.dosage}`, 25, yPosition + 15);
  pdf.text(`Frequency: ${prescription.frequency}`, 25, yPosition + 25);
  pdf.text(`Duration: ${prescription.duration}`, 25, yPosition + 35);
  
  yPosition += 50;
  
  // Special Instructions
  if (prescription.special_instructions) {
    pdf.setFont('helvetica', 'bold');
    pdf.text('Special Instructions:', 20, yPosition);
    pdf.setFont('helvetica', 'normal');
    
    // Split long text into multiple lines
    const lines = pdf.splitTextToSize(prescription.special_instructions, 170);
    pdf.text(lines, 20, yPosition + 10);
    yPosition += 10 + (lines.length * 5);
  }
  
  // Footer
  yPosition += 30;
  pdf.setFont('helvetica', 'bold');
  pdf.text('Doctor Signature: ____________________', 20, yPosition);
  
  // Disclaimer
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'italic');
  pdf.text('This is a computer generated prescription', 105, 280, { align: 'center' });
  
  return pdf;
};

export const downloadPrescriptionPDF = (prescription: PrescriptionData) => {
  const pdf = generatePrescriptionPDF(prescription);
  pdf.save(`prescription_${prescription.patient_name}_${prescription.prescribed_date}.pdf`);
};