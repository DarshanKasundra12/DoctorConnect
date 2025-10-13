import jsPDF from 'jspdf';

interface InvoiceData {
  id: string;
  invoice_number: string;
  patient_id: string;
  service_description: string;
  amount: number;
  due_date: string;
  status: string;
  created_at: string;
  patients?: { full_name: string };
}

interface DoctorData {
  name: string;
  clinic: string;
  address: string;
  phone: string;
  email: string;
}

export const generateInvoicePDF = (invoice: InvoiceData, doctorData?: DoctorData) => {
  const pdf = new jsPDF();
  const doctor = doctorData || {
    name: 'Dr. John Doe',
    clinic: 'DoctorConnect Healthcare',
    address: '123 Medical Center, Healthcare City',
    phone: '+1 (555) 123-4567',
    email: 'doctor@healthcare.com'
  };

  const pageWidth = pdf.internal.pageSize.width;
  const margin = 20;
  const contentWidth = pageWidth - (2 * margin);

  // Header with clinic branding
  pdf.setFillColor(41, 128, 185);
  pdf.rect(0, 0, pageWidth, 35, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(20);
  pdf.text(doctor.clinic, margin, 25);
  pdf.setFontSize(10);
  pdf.text(doctor.address, margin, 32);
  pdf.setTextColor(0, 0, 0);

  // Invoice title and details
  pdf.setFillColor(240, 240, 240);
  pdf.rect(pageWidth - 80, 5, 75, 25, 'F');
  pdf.setFontSize(18);
  pdf.text('INVOICE', pageWidth - 75, 20);
  pdf.setFontSize(10);
  pdf.text(`# ${invoice.invoice_number}`, pageWidth - 75, 28);

  let yPosition = 50;

  // Invoice details section
  pdf.setFillColor(248, 249, 250);
  pdf.rect(margin, yPosition, contentWidth, 40, 'F');
  pdf.setFontSize(12);
  pdf.text('Invoice Details', margin + 5, yPosition + 10);
  
  yPosition += 15;
  pdf.setFontSize(10);
  pdf.text(`Date: ${new Date(invoice.created_at).toLocaleDateString()}`, margin + 5, yPosition);
  pdf.text(`Due Date: ${new Date(invoice.due_date).toLocaleDateString()}`, margin + 5, yPosition + 8);
  pdf.text(`Status: ${invoice.status.toUpperCase()}`, margin + 5, yPosition + 16);
  
  // Contact info on the right
  pdf.text(`Phone: ${doctor.phone}`, pageWidth - margin - 60, yPosition);
  pdf.text(`Email: ${doctor.email}`, pageWidth - margin - 60, yPosition + 8);
  pdf.text(`Doctor: ${doctor.name}`, pageWidth - margin - 60, yPosition + 16);

  yPosition += 50;

  // Bill To section
  pdf.setFontSize(12);
  pdf.text('Bill To:', margin, yPosition);
  yPosition += 8;
  pdf.setFontSize(10);
  pdf.text(invoice.patients?.full_name || 'Patient Name', margin, yPosition);
  pdf.text('Patient', margin, yPosition + 8);

  yPosition += 25;

  // Service Details Table
  pdf.setFontSize(12);
  pdf.text('Service Details', margin, yPosition);
  yPosition += 10;

  // Table header
  pdf.setFillColor(240, 240, 240);
  pdf.rect(margin, yPosition, contentWidth, 12, 'F');
  pdf.setFontSize(10);
  pdf.text('Description', margin + 5, yPosition + 8);
  pdf.text('Amount', pageWidth - margin - 30, yPosition + 8);

  yPosition += 15;

  // Service row
  pdf.setFontSize(10);
  const serviceLines = pdf.splitTextToSize(invoice.service_description, contentWidth - 40);
  const lineHeight = 6;
  let serviceHeight = serviceLines.length * lineHeight;
  
  // Ensure minimum height
  if (serviceHeight < 15) serviceHeight = 15;
  
  pdf.rect(margin, yPosition, contentWidth, serviceHeight);
  pdf.text(serviceLines, margin + 5, yPosition + 8);
  pdf.text(`₹${invoice.amount.toFixed(2)}`, pageWidth - margin - 30, yPosition + 8);

  yPosition += serviceHeight + 15;

  // Total section
  pdf.setFontSize(12);
  pdf.setFillColor(240, 240, 240);
  pdf.rect(pageWidth - 80, yPosition, 75, 20, 'F');
  pdf.text('Total Amount:', pageWidth - 75, yPosition + 8);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`₹${invoice.amount.toFixed(2)}`, pageWidth - 75, yPosition + 18);

  yPosition += 40;

  // Payment terms
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Payment Terms:', margin, yPosition);
  yPosition += 8;
  pdf.text('• Payment is due within 30 days of invoice date', margin, yPosition);
  pdf.text('• Late payments may incur additional charges', margin, yPosition + 8);
  pdf.text('• For questions about this invoice, please contact us', margin, yPosition + 16);

  yPosition += 35;

  // Footer
  const pageHeight = pdf.internal.pageSize.height;
  pdf.setFontSize(8);
  pdf.setTextColor(128, 128, 128);
  pdf.text('Thank you for choosing our healthcare services.', pageWidth / 2, pageHeight - 20, { align: 'center' });
  pdf.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, pageHeight - 15, { align: 'center' });

  return pdf;
};

export const downloadInvoicePDF = (invoice: InvoiceData, doctorData?: DoctorData) => {
  const pdf = generateInvoicePDF(invoice, doctorData);
  const patientName = invoice.patients?.full_name?.replace(/\s+/g, '_') || 'patient';
  const invoiceDate = new Date(invoice.created_at).toISOString().split('T')[0];
  const fileName = `Invoice_${invoice.invoice_number}_${patientName}_${invoiceDate}.pdf`;
  pdf.save(fileName);
};
