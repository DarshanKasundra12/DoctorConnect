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
  
  // Default doctor data if not provided
  const doctor = doctorData || {
    name: 'Dr. John Doe',
    clinic: 'DoctorConnect Healthcare',
    address: '123 Medical Center, Healthcare City',
    phone: '+1 (555) 123-4567',
    email: 'doctor@healthcare.com'
  };

  // Page dimensions
  const pageWidth = pdf.internal.pageSize.width;
  const pageHeight = pdf.internal.pageSize.height;
  const margin = 20;
  const contentWidth = pageWidth - (2 * margin);

  // Header with clinic branding - Left side
  pdf.setFillColor(41, 128, 185); // Blue background
  pdf.rect(0, 0, pageWidth, 35, 'F');
  
  pdf.setTextColor(255, 255, 255); // White text
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text(doctor.clinic, margin, 25);
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(doctor.address, margin, 32);
  
  // Reset text color
  pdf.setTextColor(0, 0, 0);

  // Invoice title and details - Right side
  pdf.setFillColor(240, 240, 240); // Light gray background
  pdf.rect(pageWidth - 80, 5, 75, 25, 'F');
  
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text('INVOICE', pageWidth - 75, 20);
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`# ${invoice.invoice_number}`, pageWidth - 75, 28);

  // Invoice details section
  let yPosition = 50;
  
  // Invoice details box
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.5);
  pdf.rect(margin, yPosition, contentWidth, 40);
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Invoice Details', margin + 5, yPosition + 10);
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Invoice Date: ${new Date(invoice.created_at).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })}`, margin + 5, yPosition + 20);
  
  pdf.text(`Due Date: ${new Date(invoice.due_date).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })}`, margin + 5, yPosition + 30);
  
  pdf.text(`Status: ${invoice.status.toUpperCase()}`, pageWidth - 75, yPosition + 20);
  
  // Contact information
  pdf.text(`Phone: ${doctor.phone}`, pageWidth - 75, yPosition + 30);
  pdf.text(`Email: ${doctor.email}`, pageWidth - 75, yPosition + 40);

  yPosition += 50;

  // Bill To section
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Bill To:', margin, yPosition);
  
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.text(invoice.patients?.full_name || 'Patient Name', margin, yPosition + 10);
  pdf.text('Patient', margin, yPosition + 20);

  yPosition += 40;

  // Service Details Table
  const tableTop = yPosition;
  const tableHeight = 30;
  
  // Table header with background
  pdf.setFillColor(41, 128, 185);
  pdf.rect(margin, tableTop, contentWidth, 15, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Service Description', margin + 5, tableTop + 10);
  pdf.text('Amount', pageWidth - 50, tableTop + 10);
  
  // Table content
  pdf.setTextColor(0, 0, 0);
  pdf.setFillColor(250, 250, 250);
  pdf.rect(margin, tableTop + 15, contentWidth, tableHeight, 'F');
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  
  // Service description with proper text wrapping
  const serviceLines = pdf.splitTextToSize(invoice.service_description, contentWidth - 60);
  pdf.text(serviceLines, margin + 5, tableTop + 25);
  
  // Amount aligned to right
  pdf.setFont('helvetica', 'bold');
  pdf.text(`₹${invoice.amount.toFixed(2)}`, pageWidth - 50, tableTop + 25);
  
  // Table borders
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.5);
  pdf.rect(margin, tableTop, contentWidth, tableHeight + 15);
  pdf.line(pageWidth - 50, tableTop, pageWidth - 50, tableTop + tableHeight + 15);

  yPosition = tableTop + tableHeight + 30;

  // Total section
  pdf.setFillColor(245, 245, 245);
  pdf.rect(pageWidth - 80, yPosition, 75, 20, 'F');
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Total Amount:', pageWidth - 75, yPosition + 12);
  pdf.text(`₹${invoice.amount.toFixed(2)}`, pageWidth - 75, yPosition + 25);

  yPosition += 40;

  // Payment terms section
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Payment Terms & Methods', margin, yPosition);
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  
  const paymentTerms = [
    '• Payment is due within 30 days of invoice date',
    '• Late payments may be subject to additional fees',
    '• Accepted payment methods:',
    '  - Bank Transfer',
    '  - Credit/Debit Card',
    '  - Cash (in-person only)',
    '• For payment inquiries, contact us at the number above'
  ];
  
  paymentTerms.forEach((term, index) => {
    pdf.text(term, margin, yPosition + 10 + (index * 5));
  });

  // Footer section
  const footerY = pageHeight - 40;
  
  // Footer line
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.5);
  pdf.line(margin, footerY, pageWidth - margin, footerY);
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'italic');
  pdf.text('Thank you for choosing our healthcare services!', pageWidth / 2, footerY + 10, { align: 'center' });
  pdf.text('For any questions regarding this invoice, please contact us.', pageWidth / 2, footerY + 20, { align: 'center' });
  
  // Page number
  pdf.setFontSize(8);
  pdf.text('Page 1 of 1', pageWidth - margin, pageHeight - 10, { align: 'right' });

  return pdf;
};

export const downloadInvoicePDF = (invoice: InvoiceData, doctorData?: DoctorData) => {
  const pdf = generateInvoicePDF(invoice, doctorData);
  const patientName = invoice.patients?.full_name?.replace(/\s+/g, '_') || 'patient';
  const invoiceDate = new Date(invoice.created_at).toISOString().split('T')[0];
  const fileName = `Invoice_${invoice.invoice_number}_${patientName}_${invoiceDate}.pdf`;
  pdf.save(fileName);
};
