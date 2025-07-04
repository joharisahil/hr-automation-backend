const{findOrgbyOrgId} = require("../../model/org.model");
const {insertMed, findMedDetailsbyOrgId} = require("../../model/med.model")

exports.med = async (req, res) => {
    const { org_id } = req.body;
    const {med_name,mrp,quantity,manufactured_date,expiry_date}= req.body;
    try {
    const [org]= await findOrgbyOrgId(org_id);
    if(org.length==0){
        res.status(400).json({success:"false",
            message:"no organization found"
        })
    }

    const [medicines]=await insertMed(org_id, med_name, mrp, quantity,manufactured_date,expiry_date);

    res.status(201).json({success:"true",
        message:"medicine details  inserted",
        medicines:medicines
    });
    } catch (error) {
        console.error("error in inserting med", error)
             res.status(400).json({success:"false",
            message:"server error"
        })
    }
};

exports.medDetails = async ( req , res ) => {
    const {org_id}= req.body;
    try {
          const [org]= await findOrgbyOrgId(org_id);
    if(org.length==0){
        res.status(400).json({success:"false",
            message:"no organization found"
        })
    }

    const [medDetails]= await findMedDetailsbyOrgId(org_id);
    res.status(200).json({
        success:"true",
        medDetails
    })

    } catch (error) {
         console.error("error in fetching med name", error)
             res.status(400).json({success:"false",
            message:"server error"
        })
    }
}

