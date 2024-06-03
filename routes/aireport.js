const express = require('express');
const User_info = require('../models/user_info');
const Residence_info = require('../models/residence_info');

const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_KEY);

router
    .route('/')
    .get(async (req, res, next) => {
        try {
            //유저 정보 가져오기
            const userInfo = await User_info.findAll({
                where: { user: req.user.email },
                order: [['date', 'DESC']],
                limit: 1,
            });

            res.json({
                report: userInfo[0].dataValues.report,
                consult: userInfo[0].dataValues.consult,
            });
        } catch (err) {
            console.error(err);
            next(err);
        }
    })
    .post(async (req, res, next) => {
        try {
            // Get user information
            const userInfo = await User_info.findAll({
                where: { user: req.user.email },
                order: [['date', 'DESC']],
                limit: 1,
                include: [{ model: Residence_info }],
            });

            // Extract relevant data from user information
            const bill = userInfo[0].dataValues.bill;
            const age = userInfo[0].dataValues.Residence_info.dataValues.age;
            const houseStructure = userInfo[0].dataValues.Residence_info.dataValues.house_structure;
            const numMember = userInfo[0].dataValues.Residence_info.dataValues.num_member;
            const electricalAppliance = userInfo[0].dataValues.Residence_info.dataValues.electrical_appliance;

            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

            // Build the prompt incorporating user information
            const userPrompt = `Considering the following information:
            - Monthly electricity bill: ${bill}
            - the age range of a resident: ${age} years
            - House structure: ${houseStructure}
            - Number of members: ${numMember}
            - Electrical appliances: ${electricalAppliance}
          
            Please analyze my electricity usage and provide a comprehensive report that includes:
              - An assessment of the appropriateness of my electricity bill. Are there potential areas for reduction?
              - Based on the analysis, provide specific recommendations for reducing electricity consumption and saving money.
            
            Please present the report in a clear and concise format(Not in a descriptive way, but in a modified way), targeting a Korean audience.
            The result should be written in the form of "(1) Analysis result : Result content (2) Consultant : Consulting content"
            `;

            // Create the request with the final prompt and parameters
            const result = await model.generateContent(userPrompt);
            const response = await result.response;
            const text = response.text();

            // Handle successful response
            if (response.error) {
                console.error('Error from Google Generative AI:', response.error);
                return res.status(500).json({ error: 'Error generating text' });
            }

            console.log('Generated text:', text);

            const sections = text
                .split('**')
                .filter((section) => section.trim() != '')
                .map((section) => section.trim());

            // '(2)'로 시작하는 섹션의 인덱스를 찾음
            const indexForConsult = sections.findIndex((section) => section.startsWith('(2)'));

            // '(2)'로 시작하는 섹션 이전까지의 섹션들만 포함하도록 report 수정
            const report = sections.slice(1, indexForConsult).join('\n');

            // '(2)'로 시작하는 섹션 이후의 모든 섹션을 포함하도록 consult 수정
            const consult = sections.slice(indexForConsult + 1).join('\n');

            console.log('Report:', report);
            console.log('Consult:', consult);

            // Update the consult and report based on date and user
            await User_info.update(
                { consult: consult, report: report },
                { where: { user: req.user.email, date: userInfo[0].dataValues.date } }
            );
            // 수정된 정보를 클라이언트에 반환
            res.status(200).json({
                message: '컨설트 내용을 성공적으로 업데이트되었습니다.',
            });
        } catch (err) {
            console.error(err);
            next(err);
        }
    });

module.exports = router;
