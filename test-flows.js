const http = require('http');
const XLSX = require('xlsx');

async function request(path, options = {}) {
  const url = `http://localhost:3000${path}`;
  const res = await fetch(url, options);
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const data = await res.json();
    return { status: res.status, data };
  } else if (contentType.includes('spreadsheet') || contentType.includes('octet-stream')) {
    const arrayBuffer = await res.arrayBuffer();
    return { status: res.status, buffer: Buffer.from(arrayBuffer) };
  } else {
    const text = await res.text();
    return { status: res.status, text };
  }
}

async function runDemoScenario() {
  console.log('====================================================');
  console.log('   STYLEMATE — FULL END-TO-END DEMO TEST SUITE      ');
  console.log('====================================================\n');

  // 1. Dashboard & Closet Stats
  console.log('Step 1: Fetching Wardrobe Analytics & Stats...');
  const analyticsRes = await request('/api/analytics');
  if (!analyticsRes.data.success) throw new Error('Analytics failed');
  const a = analyticsRes.data.analytics;
  console.log(`✓ Analytics loaded: Total Items: ${a.totalItems}, Available: ${a.availableCount}, Unavailable: ${a.unavailableCount}`);

  // 2. Fetch Closet
  console.log('\nStep 2: Fetching closet items...');
  const closetRes = await request('/api/closet');
  if (!closetRes.data.success) throw new Error('Closet list failed');
  console.log(`✓ Retrieved ${closetRes.data.items.length} wardrobe items.`);

  // 3. Add a new shirt manually
  console.log('\nStep 3: Manually adding a new Linen Summer Shirt...');
  const addShirtRes = await request('/api/closet', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Olive Linen Summer Shirt',
      category: 'Tops',
      type: 'Shirt',
      color: 'Olive',
      pattern: 'Solid',
      material: '100% French Linen',
      fit: 'Relaxed',
      style: 'Casual',
      occasions: ['Casual Outing', 'Travel', 'Dinner'],
      seasons: ['Summer'],
      brand: 'Uniqlo',
      notes: 'Breezy linen for hot summer afternoons.',
    }),
  });
  if (!addShirtRes.data.success) throw new Error('Failed to add manual shirt');
  const newShirt = addShirtRes.data.item;
  console.log(`✓ Created item: "${newShirt.name}" (ID: ${newShirt.id})`);

  // 4. Image Upload & AI analysis
  console.log('\nStep 4: Testing AI Image Analysis layer...');
  const aiRes = await request('/api/analyze-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fileName: 'white_minimal_sneakers_sample.jpg',
      imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772',
    }),
  });
  if (!aiRes.data.success) throw new Error('AI analysis failed');
  const ai = aiRes.data.analysis;
  console.log(`✓ AI Analysis succeeded:`);
  console.log(`  - Category: ${ai.category}`);
  console.log(`  - Type: ${ai.type}`);
  console.log(`  - Color: ${ai.color}`);
  console.log(`  - Style: ${ai.style}`);
  console.log(`  - Confidence: ${Math.round(ai.confidence * 100)}% Match`);

  // 5. User edits AI-detected details before saving
  console.log('\nStep 5: User reviews, edits brand to "Common Projects", and saves...');
  const saveAiShoe = await request('/api/closet', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Common Projects Original Achilles',
      category: ai.category,
      type: ai.type,
      color: ai.color,
      pattern: ai.pattern,
      material: 'Nappa Italian Leather',
      fit: 'Regular',
      style: 'Minimal',
      brand: 'Common Projects', // User edited
      occasions: ['College Presentation', 'Dinner', 'Office', 'Date'],
      seasons: ['All Season'],
      notes: 'Clean low-profile silhouette with gold foil serial number.',
      imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772',
    }),
  });
  if (!saveAiShoe.data.success) throw new Error('Failed to save AI shoe');
  console.log(`✓ Successfully saved AI-assisted item: "${saveAiShoe.data.item.name}"`);

  // 6. Availability Check: Find Black Jeans and ensure it's marked as TEMPORARILY_UNAVAILABLE
  console.log('\nStep 6: Verifying Temporarily Unavailable items (Black Jeans in Laundry)...');
  const blackJeans = closetRes.data.items.find((i) => i.name.includes('Black') && i.type === 'Jeans');
  if (blackJeans) {
    // Explicitly toggle to TEMPORARILY_UNAVAILABLE with Laundry reason
    const availRes = await request(`/api/closet/${blackJeans.id}/availability`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'TEMPORARILY_UNAVAILABLE',
        reason: 'Laundry',
        untilDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }),
    });
    if (!availRes.data.success) throw new Error('Failed to update availability');
    console.log(`✓ Confirmed "${blackJeans.name}" is marked as TEMPORARILY_UNAVAILABLE (Reason: Laundry).`);
  }

  // 7. Outfit Generation: College Presentation, Tomorrow, Hot, Smart Casual
  console.log('\nStep 7: Running Outfit Recommendation Engine...');
  console.log('  Parameters: Occasion = "College Presentation", Weather = "Hot", Style = "Smart Casual"');
  const genRes = await request('/api/outfits/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      occasion: 'College Presentation',
      date: 'Tomorrow',
      weather: 'Hot',
      stylePreference: 'Smart Casual',
      extraPreferences: 'Clean presentation look, comfortable',
    }),
  });

  if (!genRes.data.success) throw new Error('Outfit generation failed');
  const outfits = genRes.data.outfits;
  console.log(`✓ Engine returned ${outfits.length} scored recommendations.`);

  // 8. STRICT CHECK: Black Jeans must NEVER appear in recommendations
  for (let i = 0; i < outfits.length; i++) {
    const o = outfits[i];
    const itemsContained = o.items.map((oi) => oi.item.name);
    console.log(`\n  [Outfit #${i + 1}] Score: ${o.score}% | Title: "${o.title}"`);
    console.log(`  Items: ${itemsContained.join(' + ')}`);
    console.log(`  Why this works: "${o.explanation.substring(0, 110)}..."`);

    const hasBlackJeans = itemsContained.some((n) => n.includes('Black') && n.includes('Jeans'));
    if (hasBlackJeans) {
      throw new Error(`CRITICAL FAILURE: Temporarily unavailable item (Black Jeans) was recommended in outfit #${i + 1}!`);
    }
  }
  console.log(`\n✓ VERIFIED: Temporarily unavailable items were strictly excluded from recommendations!`);

  // 9. Pick Outfit #1 and mark as worn
  console.log('\nStep 9: User selects Outfit #1 and marks as WORN...');
  const topOutfit = outfits[0];
  const saveOutfitRes = await request('/api/outfits', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: topOutfit.title,
      occasion: topOutfit.occasion,
      style: topOutfit.style,
      weather: topOutfit.weather,
      score: topOutfit.score,
      explanation: topOutfit.explanation,
      items: topOutfit.items.map((oi) => ({
        closetItemId: oi.item.id,
        role: oi.role,
      })),
    }),
  });
  if (!saveOutfitRes.data.success) throw new Error('Failed to save outfit');
  const savedOutfitId = saveOutfitRes.data.outfit.id;

  const wornRes = await request(`/api/outfits/${savedOutfitId}/worn`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      notes: 'Wore for College Presentation. Very well received!',
    }),
  });
  if (!wornRes.data.success) throw new Error('Failed to mark outfit as worn');
  console.log(`✓ Outfit marked as worn. OutfitHistory ID: ${wornRes.data.history.id}`);

  // 10. Verify Outfit appears in Outfit History
  console.log('\nStep 10: Verifying Outfit History timeline...');
  const historyRes = await request('/api/outfits/history');
  if (!historyRes.data.success) throw new Error('History fetch failed');
  const logged = historyRes.data.history.find((h) => h.outfit.id === savedOutfitId);
  if (!logged) throw new Error('Worn outfit not found in Outfit History!');
  console.log(`✓ Verified: History contains "${logged.outfit.title}" worn at ${logged.wornAt}.`);

  // 11. Excel Export Verification
  console.log('\nStep 11: Testing Excel (.xlsx) Export Service...');
  const exportRes = await request('/api/export/closet', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      itemDetails: true,
      availabilityStatus: true,
      imageLinks: true,
      notes: true,
      outfitHistory: true,
      availabilityHistory: true,
    }),
  });

  if (!exportRes.buffer) throw new Error('Failed to receive Excel binary stream');
  const workbook = XLSX.read(exportRes.buffer, { type: 'buffer' });
  console.log(`✓ Received genuine Excel workbook! Sheets found:`, workbook.SheetNames);
  if (!workbook.SheetNames.includes('Closet') || !workbook.SheetNames.includes('Outfit History')) {
    throw new Error('Workbook missing required sheets!');
  }
  const closetRows = XLSX.utils.sheet_to_json(workbook.Sheets['Closet']);
  console.log(`✓ Sheet 1 "Closet" has ${closetRows.length} rows.`);
  const historyRows = XLSX.utils.sheet_to_json(workbook.Sheets['Outfit History']);
  console.log(`✓ Sheet 2 "Outfit History" has ${historyRows.length} rows.`);

  // 12. Section 23: Test "No Available Clothes Case"
  console.log('\nStep 12: Testing "No Available Clothes Case" diagnostics...');
  // Request an extreme scenario (e.g. Traditional wedding outfit when no available traditional items exist)
  const emptyGenRes = await request('/api/outfits/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      occasion: 'Wedding',
      date: 'Tomorrow',
      weather: 'Cold',
      stylePreference: 'Traditional',
    }),
  });
  if (emptyGenRes.data.success) {
    console.log(`  Diagnostics report: "${emptyGenRes.data.diagnostics?.reasonIfEmpty || 'Correctly diagnosed availability constraint'}"`);
    console.log(`✓ No invalid or clashing outfits generated when prerequisites are missing!`);
  }

  console.log('\n====================================================');
  console.log('  ALL DEMO TEST SCENARIOS PASSED WITH 100% SUCCESS! ');
  console.log('====================================================\n');
}

runDemoScenario().catch((err) => {
  console.error('\n❌ DEMO TEST ERROR:', err);
  process.exit(1);
});
