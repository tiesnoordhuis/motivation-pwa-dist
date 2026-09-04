import{i as e}from"./response-helpers-D25xnx34.js";import{t}from"./logger-D1g42DRq.js";import{t as n}from"./uuid-BofLEMA4.js";import{d as r}from"./app-timezone.service-dss6z4Bm.js";var i=`
    id, date, meal_type, food_item_id, amount,
    calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg,
    source_meal_id, meal_occurrence_id, consumed_at, created_at, updated_at
`,a=365,o=30,s=e=>`SUM(pow(0.5, (julianday('now') - julianday(${e})) / ${o}.0))`,c=`
    fi.id, fi.canonical_name, fi.display_name, fi.brand, fi.barcode,
    fi.source, fi.source_ref, fi.base_amount, fi.base_unit, fi.default_serving_amount,
    fi.serving_label, fi.serving_quantity,
    fi.calories_per_base, fi.protein_g_per_base, fi.carbs_g_per_base, fi.fat_g_per_base,
    fi.fiber_g_per_base, fi.sugar_g_per_base, fi.sodium_mg_per_base,
    fi.use_count, fi.last_used_at, fi.raw_json, fi.image_path, fi.archived_at, fi.created_at, fi.updated_at
`,l=`
    m.id, m.name, m.notes, m.default_scale, m.use_count, m.last_used_at,
    m.image_path, m.created_at, m.updated_at
`;function u(e){return e.kind===`food`?e.item.display_name:e.meal.name}var d=10;function f(e){let t=[...e].sort((e,t)=>e-t),n=t.length,r=Math.floor(n/2);return n%2==1?t[r]:(t[r-1]+t[r])/2}async function p(e,t){let r=n();return await e.execute(`
            INSERT INTO consumption_entries (
                id, date, meal_type, food_item_id, amount,
                calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg,
                source_meal_id, meal_occurrence_id, consumed_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,r,t.date,t.meal_type,t.food_item_id,t.amount,t.calories??null,t.protein_g??null,t.carbs_g??null,t.fat_g??null,t.fiber_g??null,t.sugar_g??null,t.sodium_mg??null,t.source_meal_id??null,t.meal_occurrence_id??null,t.consumed_at??null),await m(e,t.food_item_id),r}async function m(e,t){let n=await e.query(`SELECT amount FROM consumption_entries
         WHERE food_item_id = ?
         ORDER BY rowid DESC
         LIMIT ${d}`,t);if(n.length===0)return;let r=n.length<=2?n[0].amount:f(n.map(e=>e.amount));await e.execute(`UPDATE food_items SET default_serving_amount = ?, updated_at = datetime('now') WHERE id = ?`,r,t)}function h(e,t){let n=e.base_amount;if(!Number.isFinite(n)||n<=0||!Number.isFinite(t))return{calories:null,protein_g:null,carbs_g:null,fat_g:null,fiber_g:null,sugar_g:null,sodium_mg:null};let r=t/n,i=e=>typeof e!=`number`||!Number.isFinite(e)?null:e*r;return{calories:i(e.calories_per_base),protein_g:i(e.protein_g_per_base),carbs_g:i(e.carbs_g_per_base),fat_g:i(e.fat_g_per_base),fiber_g:i(e.fiber_g_per_base),sugar_g:i(e.sugar_g_per_base),sodium_mg:i(e.sodium_mg_per_base)}}function g(n,o={}){let d=o.log??t,f={async findById(e){return d.debug(`consumption.findById`,{id:e}),n.queryOne(`SELECT ${i} FROM consumption_entries WHERE id = ?`,[e])},async getById(t){return d.debug(`consumption.getById`,{id:t}),n.queryOne(`SELECT ${i} FROM consumption_entries WHERE id = ?`,[t],{notFound:()=>new e(`Consumption entry ${t} not found`)})},async getByDate(e){return d.debug(`consumption.getByDate`,{date:e}),n.query(`SELECT ${i} FROM consumption_entries WHERE date = ? ORDER BY meal_type, created_at`,e)},async getByDateRange(e,t){return d.debug(`consumption.getByDateRange`,{from:e,to:t}),n.query(`SELECT ${i} FROM consumption_entries WHERE date >= ? AND date <= ? ORDER BY date DESC, meal_type, created_at`,e,t)},async getDateRangeSummary(e,t){return d.debug(`consumption.getDateRangeSummary`,{from:e,to:t}),n.query(`
                    SELECT date,
                           COALESCE(SUM(calories), 0) AS total_calories,
                           COALESCE(SUM(protein_g), 0) AS total_protein_g,
                           COALESCE(SUM(carbs_g), 0) AS total_carbs_g,
                           COALESCE(SUM(fat_g), 0) AS total_fat_g,
                           COALESCE(SUM(fiber_g), 0) AS total_fiber_g,
                           COUNT(*) AS entry_count
                    FROM consumption_entries
                    WHERE date >= ? AND date <= ?
                    GROUP BY date
                    ORDER BY date DESC
                `,e,t)},async frequentByMealType(e,t=24){d.debug(`consumption.frequentByMealType`,{mealType:e,limit:t});let[r,i]=await Promise.all([n.query(`
                        SELECT ${c},
                               ${s(`ce.date`)} AS score,
                               MAX(ce.date) AS last_at
                        FROM consumption_entries ce
                        JOIN food_items fi ON fi.id = ce.food_item_id
                        WHERE ce.meal_type = ?
                          AND ce.source_meal_id IS NULL
                          AND ce.date >= date('now', '-${a} days')
                          AND fi.archived_at IS NULL
                        GROUP BY ce.food_item_id
                        ORDER BY score DESC, last_at DESC, fi.display_name ASC
                        LIMIT ?
                    `,e,t),n.query(`
                        SELECT ${l},
                               ${s(`o.date`)} AS score,
                               MAX(o.date) AS last_at
                        FROM (
                            SELECT DISTINCT source_meal_id, meal_occurrence_id, date
                            FROM consumption_entries
                            WHERE meal_type = ?
                              AND source_meal_id IS NOT NULL
                              AND date >= date('now', '-${a} days')
                        ) o
                        JOIN meals m ON m.id = o.source_meal_id
                        GROUP BY o.source_meal_id
                        ORDER BY score DESC, last_at DESC, m.name ASC
                        LIMIT ?
                    `,e,t)]);return[...r.map(({score:e,last_at:t,...n})=>({kind:`food`,score:e,last_at:t,item:n})),...i.map(({score:e,last_at:t,...n})=>({kind:`meal`,score:e,last_at:t,meal:n}))].sort((e,t)=>t.score-e.score||t.last_at.localeCompare(e.last_at)||u(e).localeCompare(u(t))).slice(0,t)},async create(e){d.debug(`consumption.create: BEGIN`,{date:e.date,foodItemId:e.food_item_id}),await n.execute(`BEGIN TRANSACTION`);try{let t=await p(n,e);return await n.execute(`COMMIT`),d.debug(`consumption.create: COMMIT`,{id:t}),f.getById(t)}catch(e){throw await n.execute(`ROLLBACK`),d.warn(`consumption.create: ROLLBACK`,{error:e instanceof Error?e.message:String(e)}),e}},async createForFoodItem(e,t){let n=h(e,t.amount);return f.create({date:t.date,meal_type:t.meal_type,food_item_id:e.id,amount:t.amount,calories:t.overrides?.calories??n.calories??void 0,protein_g:t.overrides?.protein_g??n.protein_g??void 0,carbs_g:t.overrides?.carbs_g??n.carbs_g??void 0,fat_g:t.overrides?.fat_g??n.fat_g??void 0,fiber_g:t.overrides?.fiber_g??n.fiber_g??void 0,sugar_g:t.overrides?.sugar_g??n.sugar_g??void 0,sodium_mg:t.overrides?.sodium_mg??n.sodium_mg??void 0,source_meal_id:t.overrides?.source_meal_id,meal_occurrence_id:t.overrides?.meal_occurrence_id,consumed_at:t.overrides?.consumed_at})},async update(e,t){let r=await f.getById(e);d.debug(`consumption.update`,{id:e,fields:Object.keys(t)});let i=[],a=[];for(let e of[`date`,`meal_type`,`food_item_id`,`amount`,`calories`,`protein_g`,`carbs_g`,`fat_g`,`fiber_g`,`sugar_g`,`sodium_mg`,`source_meal_id`,`meal_occurrence_id`,`consumed_at`])t[e]!==void 0&&(i.push(`${e} = ?`),a.push(t[e]??null));if(i.length===0)return r;i.push(`updated_at = datetime('now')`),a.push(e);let o=t.food_item_id??r.food_item_id,s=`amount`in t&&t.amount!==r.amount,c=o!==r.food_item_id;d.debug(`consumption.update: BEGIN`,{id:e}),await n.execute(`BEGIN TRANSACTION`);try{await n.execute(`UPDATE consumption_entries SET ${i.join(`, `)} WHERE id = ?`,...a),(s||c)&&(await m(n,o),c&&await m(n,r.food_item_id)),await n.execute(`COMMIT`),d.debug(`consumption.update: COMMIT`,{id:e})}catch(t){throw await n.execute(`ROLLBACK`),d.warn(`consumption.update: ROLLBACK`,{id:e,error:t instanceof Error?t.message:String(t)}),t}return f.getById(e)},async delete(e){let t=await f.findById(e);if(!t)return!1;d.debug(`consumption.delete: BEGIN`,{id:e}),await n.execute(`BEGIN TRANSACTION`);try{await n.execute(`DELETE FROM consumption_entries WHERE id = ?`,e),await m(n,t.food_item_id),await n.execute(`COMMIT`),d.debug(`consumption.delete: COMMIT`,{id:e})}catch(t){throw await n.execute(`ROLLBACK`),d.warn(`consumption.delete: ROLLBACK`,{id:e,error:t instanceof Error?t.message:String(t)}),t}return!0},async getByOccurrenceId(e){return d.debug(`consumption.getByOccurrenceId`,{occurrenceId:e}),n.query(`SELECT ${i} FROM consumption_entries WHERE meal_occurrence_id = ? ORDER BY rowid`,e)},async scaleOccurrence(e,t){if(!Number.isFinite(t)||t<=0)throw Error(`scaleOccurrence: factor must be a positive finite number, got ${t}`);let r=await f.getByOccurrenceId(e);if(r.length===0)return[];let i=[...new Set(r.map(e=>e.food_item_id))];d.debug(`consumption.scaleOccurrence: BEGIN`,{occurrenceId:e,factor:t,count:r.length}),await n.execute(`BEGIN TRANSACTION`);try{await n.execute(`UPDATE consumption_entries SET
                        amount = amount * ?,
                        calories = calories * ?,
                        protein_g = protein_g * ?,
                        carbs_g = carbs_g * ?,
                        fat_g = fat_g * ?,
                        fiber_g = fiber_g * ?,
                        sugar_g = sugar_g * ?,
                        sodium_mg = sodium_mg * ?,
                        updated_at = datetime('now')
                     WHERE meal_occurrence_id = ?`,t,t,t,t,t,t,t,t,e);for(let e of i)await m(n,e);await n.execute(`COMMIT`),d.debug(`consumption.scaleOccurrence: COMMIT`,{occurrenceId:e})}catch(t){throw await n.execute(`ROLLBACK`),d.warn(`consumption.scaleOccurrence: ROLLBACK`,{occurrenceId:e,error:t instanceof Error?t.message:String(t)}),t}return f.getByOccurrenceId(e)},async moveOccurrence(e,t){let i=[],a=[];if(t.date!==void 0&&(i.push(`date = ?`),a.push(t.date)),t.meal_type!==void 0&&(i.push(`meal_type = ?`),a.push(t.meal_type)),i.length===0)return f.getByOccurrenceId(e);let o=t.date===void 0?[]:(await f.getByOccurrenceId(e)).filter(e=>e.consumed_at!=null);i.push(`updated_at = datetime('now')`),a.push(e),d.debug(`consumption.moveOccurrence: BEGIN`,{occurrenceId:e,fields:Object.keys(t)}),await n.execute(`BEGIN TRANSACTION`);try{if(await n.execute(`UPDATE consumption_entries SET ${i.join(`, `)} WHERE meal_occurrence_id = ?`,...a),o.length>0){let e=r(t.timeZone),i=Temporal.PlainDate.from(t.date);for(let t of o){let r=Temporal.Instant.from(t.consumed_at).toZonedDateTimeISO(e).toPlainTime(),a=i.toZonedDateTime({timeZone:e,plainTime:r}).toInstant().toString();await n.execute(`UPDATE consumption_entries SET consumed_at = ? WHERE id = ?`,a,t.id)}}await n.execute(`COMMIT`),d.debug(`consumption.moveOccurrence: COMMIT`,{occurrenceId:e})}catch(t){throw await n.execute(`ROLLBACK`),d.warn(`consumption.moveOccurrence: ROLLBACK`,{occurrenceId:e,error:t instanceof Error?t.message:String(t)}),t}return f.getByOccurrenceId(e)},async deleteOccurrence(e){let t=await f.getByOccurrenceId(e);if(t.length===0)return 0;let r=[...new Set(t.map(e=>e.food_item_id))];d.debug(`consumption.deleteOccurrence: BEGIN`,{occurrenceId:e,count:t.length}),await n.execute(`BEGIN TRANSACTION`);try{await n.execute(`DELETE FROM consumption_entries WHERE meal_occurrence_id = ?`,e);for(let e of r)await m(n,e);await n.execute(`COMMIT`),d.debug(`consumption.deleteOccurrence: COMMIT`,{occurrenceId:e})}catch(t){throw await n.execute(`ROLLBACK`),d.warn(`consumption.deleteOccurrence: ROLLBACK`,{occurrenceId:e,error:t instanceof Error?t.message:String(t)}),t}return t.length}};return f}export{g as n,p as r,h as t};
//# sourceMappingURL=consumption-entries.repository-U2EiVMI2.js.map