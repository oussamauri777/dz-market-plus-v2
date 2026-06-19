const m = require('algeria-locations');
const fs = require('fs');

const wilayas = m.getWilayas();
const lines = [];
lines.push('class AlgeriaLocation {');
lines.push('  final int id;');
lines.push('  final String code;');
lines.push('  final String name;');
lines.push('  final String nameAr;');
lines.push('  const AlgeriaLocation({required this.id, required this.code, required this.name, required this.nameAr});');
lines.push('}');
lines.push('');

lines.push('const List<AlgeriaLocation> algerianWilayas = [');
for (const w of wilayas) {
  const name = w.name.replace(/'/g, "\\'");
  const nameAr = w.name_ar.replace(/'/g, "\\'");
  lines.push(`  AlgeriaLocation(id: ${w.id}, code: '${w.code}', name: '${name}', nameAr: '${nameAr}'),`);
}
lines.push('];');
lines.push('');

lines.push('const Map<int, List<AlgeriaLocation>> algerianCommunes = {');
for (const w of wilayas) {
  const communes = m.getCommunesByWilayaId(w.id);
  lines.push(`  ${w.id}: [`);
  for (const c of communes) {
    const name = c.name.replace(/'/g, "\\'");
    const nameAr = c.name_ar.replace(/'/g, "\\'");
    lines.push(`    AlgeriaLocation(id: ${c.id}, code: '${c.code}', name: '${name}', nameAr: '${nameAr}'),`);
  }
  lines.push('  ],');
}
lines.push('};');
lines.push('');

lines.push('List<AlgeriaLocation> getCommunesByWilayaId(int wilayaId) => algerianCommunes[wilayaId] ?? [];');
lines.push('List<AlgeriaLocation> getCommunesByWilayaName(String wilayaName) {');
lines.push('  final wilaya = algerianWilayas.firstWhere((w) => w.name == wilayaName, orElse: () => algerianWilayas.first);');
lines.push('  return algerianCommunes[wilaya.id] ?? [];');
lines.push('}');

fs.writeFileSync('../dzmarket_plus_mobile/lib/core/data/algeria_locations.dart', lines.join('\n'), 'utf8');
console.log('Generated ' + lines.length + ' lines');
console.log('Wilayas: ' + wilayas.length);
for (const w of wilayas) {
  const c = m.getCommunesByWilayaId(w.id);
  console.log('  ' + w.code + ' - ' + w.name + ': ' + c.length + ' communes');
}
