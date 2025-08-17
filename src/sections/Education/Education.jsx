import React from 'react';
import './Education.css'; // Enhanced CSS for responsiveness and animations

const Education = () => {
  return (
    <div className="education-container">
      <h1 className="education-title">Education</h1>
      <table className="education-table">
        <thead>
          <tr>
            <th>Degree</th>
            <th>Institution</th>
            <th style={{paddingRight:'4rem'}}>Year</th>
            <th>Percentage</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Bachelor of Technology in Computer Science</td>
            <td>Chandigarh Group of Colleges, Landran, Mohali, Punjab</td>
            <td>2020-2024</td>
            <td>86.3%</td>
          </tr>
          <tr>
            <td>Senior Secondary Education (Class 12)</td>
            <td>DAV Public School, Yamuna Nagar, Haryana</td>
            <td>2019-2020</td>
            <td>92.6%</td>
          </tr>
          <tr>
            <td>Secondary Education (Class 10)</td>
            <td>DAV Public School, Yamuna Nagar, Haryana</td>
            <td>2017-2018</td>
            <td>91.4%</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default Education;
