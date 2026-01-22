import jsPDF from 'jspdf';

export const generateCropPDF = (crop, materials) => {
  const doc = new jsPDF();
  
  // Header with Background
  doc.setFillColor(34, 139, 34);
  doc.rect(0, 0, 210, 35, 'F');
  
  // Title
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('KISAN PROFIT MITRA', 105, 15, { align: 'center' });
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('Crop Report', 105, 25, { align: 'center' });
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  
  // Crop Details Section
  let yPos = 45;
  doc.setFillColor(240, 248, 255);
  doc.rect(15, yPos - 5, 180, 8, 'F');
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Crop Details', 20, yPos);
  
  yPos += 10;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  const cropDetails = [
    { label: 'Crop Name:', value: crop.cropType },
    { label: 'Start Date:', value: new Date(crop.startDate).toLocaleDateString('en-IN') },
    crop.completedAt ? { label: 'End Date:', value: new Date(crop.completedAt).toLocaleDateString('en-IN') } : null,
    { label: 'Land Area:', value: crop?.landSize?.value && crop?.landSize?.unit ? `${crop.landSize.value} ${crop.landSize.unit}` : 'Not Available' },
    { label: 'Duration:', value: `${crop.expectedDuration} months` },
    { label: 'Status:', value: crop.status === 'चालू' ? 'Active' : 'Completed' }
  ].filter(Boolean);
  
  cropDetails.forEach(detail => {
    doc.setFont('helvetica', 'bold');
    doc.text(detail.label, 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(detail.value, 65, yPos);
    yPos += 7;
  });
  
  // Expenses Section
  yPos += 10;
  doc.setFillColor(240, 248, 255);
  doc.rect(15, yPos - 5, 180, 8, 'F');
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Expense Details', 20, yPos);
  
  yPos += 12;
  
  if (!materials || materials.length === 0) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('No expenses recorded', 20, yPos);
    yPos += 10;
  } else {
    // Table header
    doc.setFillColor(220, 220, 220);
    doc.rect(15, yPos - 5, 180, 8, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Date', 20, yPos);
    doc.text('Type', 50, yPos);
    doc.text('Name', 80, yPos);
    doc.text('Qty', 120, yPos);
    doc.text('Rate (Rs)', 145, yPos);
    doc.text('Total (Rs)', 170, yPos);
    
    yPos += 8;
    doc.setFont('helvetica', 'normal');
    
    // Group by type for summary
    const groupedByType = materials.reduce((acc, mat) => {
      if (!acc[mat.materialType]) {
        acc[mat.materialType] = [];
      }
      acc[mat.materialType].push(mat);
      return acc;
    }, {});
    
    // Type translation
    const typeTranslation = {
      'बीज': 'Seeds',
      'खाद': 'Fertilizer',
      'दवाई': 'Medicine',
      'कीटनाशक': 'Pesticide',
      'मजदूरी': 'Labour',
      'ट्रैक्टर/उपकरण': 'Tractor',
      'पानी/बिजली': 'Water/Electricity',
      'परिवहन': 'Transport',
      'भंडारण': 'Storage',
      'अन्य': 'Other'
    };
    
    // Unit translation
    const unitTranslation = {
      'किलोग्राम': 'kg',
      'लीटर': 'ltr',
      'पैकेट': 'pkt',
      'बोरी': 'bag',
      'दिन': 'days',
      'घंटा': 'hrs',
      'पीस': 'pcs',
      'बोतल': 'btl',
      'व्यक्ति': 'person'
    };
    
    // Show expenses by category
    Object.entries(groupedByType).forEach(([type, items]) => {
      if (yPos > 265) {
        doc.addPage();
        yPos = 20;
      }
      
      // Category header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(typeTranslation[type] || type, 20, yPos);
      yPos += 5;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      
      items.forEach(material => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        
        const dateText = new Date(material.date).toLocaleDateString('en-IN');
        const nameText = material.materialName || '-';
        const translatedUnit = unitTranslation[material.quantity?.unit] || material.quantity?.unit || '';
        const qtyText = material.quantity ? `${material.quantity.value} ${translatedUnit}` : '-';
        const rateText = material.pricePerUnit ? material.pricePerUnit.toFixed(2) : '-';
        const priceText = material.price ? material.price.toFixed(2) : '0.00';
        
        doc.text(dateText, 20, yPos);
        doc.text(nameText, 80, yPos, { maxWidth: 35 });
        doc.text(qtyText, 120, yPos);
        doc.text(rateText, 145, yPos);
        doc.text(priceText, 170, yPos);
        yPos += 5;
      });
      
      yPos += 3;
    });
  }
  
  // Financial Summary
  yPos += 10;
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }
  
  doc.setFillColor(240, 248, 255);
  doc.rect(15, yPos - 5, 180, 8, 'F');
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Financial Summary', 20, yPos);
  
  yPos += 12;
  doc.setFontSize(11);
  
  // Total Cost
  doc.setFont('helvetica', 'bold');
  doc.text('Total Cost:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(`Rs ${crop.totalCost?.toFixed(2) || '0.00'}`, 170, yPos);
  yPos += 8;
  
  // Production & Profit (if completed)
  if (crop.status === 'पूर्ण' && crop.production) {
    // Unit translation for production
    const unitTranslation = {
      'किलोग्राम': 'kg',
      'लीटर': 'ltr',
      'पैकेट': 'pkt',
      'बोरी': 'bag',
      'क्विंटल': 'quintal',
      'टन': 'ton'
    };
    const prodUnit = unitTranslation[crop.production.unit] || crop.production.unit;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Production:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(`${crop.production.quantity} ${prodUnit}`, 170, yPos);
    yPos += 8;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Selling Price:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(`Rs ${crop.production.sellingPrice}/${prodUnit}`, 170, yPos);
    yPos += 8;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Total Income:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(`Rs ${crop.totalIncome?.toFixed(2) || '0.00'}`, 170, yPos);
    yPos += 10;
    
    // Net Profit/Loss with highlight
    const isProfit = crop.netProfit >= 0;
    doc.setFillColor(isProfit ? 144 : 220, isProfit ? 238 : 20, isProfit ? 144 : 60);
    doc.rect(15, yPos - 5, 180, 10, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(isProfit ? 0 : 139, isProfit ? 100 : 0, 0);
    doc.text(`Net ${isProfit ? 'Profit' : 'Loss'}:`, 20, yPos);
    doc.text(`Rs ${Math.abs(crop.netProfit || 0).toFixed(2)}`, 170, yPos);
    doc.setTextColor(0, 0, 0);
  }
  
  // Footer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(128, 128, 128);
  const footerText = `Report Generated: ${new Date().toLocaleDateString('en-IN')} ${new Date().toLocaleTimeString('en-IN')}`;
  doc.text(footerText, 105, 285, { align: 'center' });
  
  // Open PDF in new tab for preview instead of auto-download
  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  window.open(pdfUrl, '_blank');
};
