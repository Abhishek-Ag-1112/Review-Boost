import { NextRequest, NextResponse } from 'next/server';
import { Document, Page, Text, View, Image, StyleSheet, pdf } from '@react-pdf/renderer';

// Premium Elegant PDF Styles using built-in Helvetica (100% robust, 0 network dependencies)
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    backgroundColor: '#f8fafc', // Clean slate-50 light background
    alignItems: 'center',
    justifyContent: 'center',
    padding: 36,
  },
  cardContainer: {
    width: '100%',
    height: '100%',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 40,
    paddingHorizontal: 24,
    backgroundColor: '#ffffff',
    position: 'relative',
  },
  topAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 12,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  headerBlock: {
    alignItems: 'center',
    width: '100%',
  },
  logo: {
    borderWidth: 1.5,
    borderColor: '#f1f5f9',
    objectFit: 'cover',
    marginBottom: 12,
  },
  businessName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 6,
  },
  tagline: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
    maxWidth: '85%',
    lineHeight: 1.4,
  },
  qrWrapper: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#f1f5f9',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrImage: {
    width: 180,
    height: 180,
  },
  footerBlock: {
    alignItems: 'center',
    width: '100%',
  },
  ctaPill: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 99,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 16,
  },
  subCta: {
    fontSize: 8,
    color: '#64748b',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  branding: {
    fontSize: 7,
    color: '#cbd5e1',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  // Folding guides for A5 dynamic table tents
  foldingLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
    borderStyle: 'dashed',
    width: '100%',
    marginVertical: 12,
  },
  foldingText: {
    fontSize: 7,
    color: '#94a3b8',
    textAlign: 'center',
  }
});

// React PDF Document structure
const PrintTemplate = ({ qrDataUrl, businessName, tagline, brandColor, size, logoDataUrl }: any) => {
  const isCard = size === 'card';
  const isA5 = size === 'a5';

  // Sizing adapters
  const logoSize = isCard ? 28 : (isA5 ? 44 : 56);
  const qrSize = isCard ? 85 : (isA5 ? 140 : 190);

  return (
    <Document>
      <Page 
        size={isCard ? [240, 160] : (isA5 ? 'A5' : 'A4')} 
        style={[styles.page, isCard && { padding: 10 }]}
      >
        <View style={[styles.cardContainer, isCard && { paddingVertical: 14, paddingHorizontal: 12, borderRadius: 16 }]}>
          {/* Top colored accent bar */}
          <View style={[styles.topAccent, { backgroundColor: brandColor || '#059669' }, isCard && { height: 6, borderTopLeftRadius: 14, borderTopRightRadius: 14 }]} />

          {/* Header Block */}
          <View style={styles.headerBlock}>
            {logoDataUrl && (
              <Image 
                src={logoDataUrl} 
                style={[
                  styles.logo, 
                  { 
                    width: logoSize, 
                    height: logoSize, 
                    borderRadius: logoSize / 2, 
                    borderWidth: isCard ? 1 : 1.5,
                    marginBottom: isCard ? 4 : 12 
                  }
                ]} 
              />
            )}
            <Text style={[styles.businessName, { fontSize: isCard ? 11 : (isA5 ? 20 : 24), marginBottom: isCard ? 2 : 6 }]}>
              {businessName}
            </Text>
            <Text style={[styles.tagline, { fontSize: isCard ? 6.5 : (isA5 ? 10 : 11) }]}>
              {tagline || 'Your feedback helps us grow. Scan to write a review!'}
            </Text>
          </View>

          {/* QR Code Container Wrapper */}
          <View style={[styles.qrWrapper, isCard && { padding: 8, borderRadius: 10 }, { width: qrSize + (isCard ? 16 : 32), height: qrSize + (isCard ? 16 : 32) }]}>
            <Image 
              src={qrDataUrl} 
              style={{ width: qrSize, height: qrSize }} 
            />
          </View>

          {/* Footer block */}
          <View style={styles.footerBlock}>
            <Text 
              style={[
                styles.ctaPill, 
                { 
                  backgroundColor: brandColor || '#059669',
                  fontSize: isCard ? 8 : 11,
                  paddingVertical: isCard ? 5 : 8,
                  paddingHorizontal: isCard ? 16 : 24,
                  marginBottom: isCard ? 4 : 16
                }
              ]}
            >
              Scan to Review
            </Text>

            {isA5 && (
              <View style={{ width: '100%', alignItems: 'center', marginTop: 6, marginBottom: 6 }}>
                <View style={styles.foldingLine} />
                <Text style={styles.foldingText}>Fold here to stand on table (Table Tent)</Text>
              </View>
            )}

            <Text style={[styles.subCta, isCard && { fontSize: 5, letterSpacing: 1, marginBottom: 2 }]}>
              We value your honest feedback
            </Text>
            <Text style={[styles.branding, isCard && { fontSize: 4 }]}>
              Powered by ReviewBoost
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export async function POST(request: NextRequest) {
  try {
    const { qrDataUrl, businessName, tagline, brandColor, size, logoUrl } = await request.json();

    if (!qrDataUrl || !businessName) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Pre-fetch and convert logoUrl to dynamic base64 data url inside standard Node fetch context.
    // This fully isolates react-pdf from doing outbound network fetches and prevents SSL/CORS crashes.
    let logoDataUrl = null;
    if (logoUrl && typeof logoUrl === 'string' && logoUrl.startsWith('http')) {
      try {
        const logoRes = await fetch(logoUrl, { 
          headers: { 'User-Agent': 'Mozilla/5.0' },
          next: { revalidate: 600 } 
        });
        if (logoRes.ok) {
          const arrayBuffer = await logoRes.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const mimeType = logoRes.headers.get('content-type') || 'image/png';
          logoDataUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;
        }
      } catch (err) {
        console.warn('[PDF Pre-fetch] Failed to retrieve logo image, generating without logo:', err);
      }
    }

    // Render PDF Document to Buffer stream
    const blob = await pdf(
      <PrintTemplate 
        qrDataUrl={qrDataUrl} 
        businessName={businessName} 
        tagline={tagline} 
        brandColor={brandColor} 
        size={size} 
        logoDataUrl={logoDataUrl}
      />
    ).toBlob();

    const pdfBuffer = Buffer.from(await blob.arrayBuffer());

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${size}-standee.pdf"`
      }
    });
  } catch (error) {
    console.error('PDF Generation Error:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
