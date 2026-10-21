// ============================================================
//  每個 Topic 的出題指引（Prompt Engineering）
//  key = topic 編號（"01" ~ "18"），內容會被放進 user prompt 的 {{topicGuide}}
//  建議寫：考核範圍、常見題型、常見錯誤（用來設計選擇題干擾項）、不要出的內容
// ============================================================

export const TOPIC_GUIDES: Record<string, string> = {
  "01": `- Scope: rounding off, significant figures, decimal places, scientific notation, estimation strategies, absolute / relative / percentage errors.
- TODO: 補充你的出題指引`,
  "02": `- Scope: percentage change, simple and compound interest, growth and depreciation, profit and loss, successive / reverse percentage change.
- TODO: 補充你的出題指引`,
  "03": `- Scope: laws of integral indices, rational indices, logarithms and their properties, exponential and logarithmic equations, graphs.
- TODO: 補充你的出題指引`,
  "04": `- Scope: factorization, H.C.F./L.C.M. of polynomials, division of polynomials, remainder theorem, factor theorem.
- TODO: 補充你的出題指引`,
  "05": `- Scope: substitution into formulas, change of subject, algebraic fractions.
- TODO: 補充你的出題指引`,
  "06": `- Scope: identities, quadratic equations (roots, discriminant, sum/product of roots), complex numbers, simultaneous equations.
- TODO: 補充你的出題指引`,
  "07": `- Scope: functions and notation, domain, graphs of quadratic functions (vertex, axis of symmetry), transformations of graphs, solving equations graphically.
- TODO: 補充你的出題指引`,
  "08": `- Scope: rates, ratios, direct / inverse / joint / partial variation.
- TODO: 補充你的出題指引`,
  "09": `- Scope: arithmetic and geometric sequences and their sums, sum to infinity, applications.
- TODO: 補充你的出題指引`,
  "10": `- Scope: linear and quadratic inequalities, compound inequalities, linear programming.
- TODO: 補充你的出題指引`,
  "11": `- Scope: triangles, congruence and similarity, quadrilaterals, polygons, angle properties, deductive geometry proofs.
- TODO: 補充你的出題指引`,
  "12": `- Scope: chords, arcs, angles in circles, cyclic quadrilaterals, tangents, alternate segment theorem, geometric proofs.
- TODO: 補充你的出題指引`,
  "13": `- Scope: trigonometric ratios, identities, trigonometric equations, graphs of trigonometric functions.
- TODO: 補充你的出題指引`,
  "14": `- Scope: sine and cosine formulas, area of triangle, Heron's formula, bearings, angles of elevation/depression, 3D problems.
- TODO: 補充你的出題指引`,
  "15": `- Scope: arc length, sector area, surface area and volume of solids (prisms, cylinders, pyramids, cones, spheres), similar figures.
- TODO: 補充你的出題指引`,
  "16": `- Scope: distance, slope, mid-point, section formula, equations of straight lines and circles, loci, intersections.
- TODO: 補充你的出題指引`,
  "17": `- Scope: addition and multiplication rules, permutations and combinations, probability, expectation.
- TODO: 補充你的出題指引`,
  "18": `- Scope: statistical diagrams, measures of central tendency and dispersion (range, IQR, standard deviation), standard scores, effect of data changes.
- TODO: 補充你的出題指引`,
};
