const db= require("../config/db")

exports.insertMed = (org_id, med_name, mrp, quantity,manufactured_date,expiry_date) =>
    db.query("insert into medicines (org_id, med_name, mrp, quantity,manufactured_date,expiry_date) values (?, ?, ?, ?, ?, ?)",
        [org_id, med_name, mrp, quantity,manufactured_date,expiry_date]);

exports.findMedDetailsbyOrgId= (org_id)=> 
    db.query("select * from medicines where org_id=?",[org_id]);