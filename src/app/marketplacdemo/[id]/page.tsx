"use client";

import React, { useEffect, useState } from "react";
import { useMediaQuery, Input } from "@mui/material";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

type Params = Promise<{ id: string }>

export default function ResponsivePage(props: { params: Params }) {
  const isMobile = useMediaQuery('(max-width: 480px)') ? true : false;
  const [id, setId] = useState<string>('');
  const [data, setData] = useState<any>({});


  useEffect(() => {
      const getIdFromParam = async () => {
        const params = await props.params;
        const pid: any = params.id;
        const data = await fetch(`/api/marketplace/user`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: pid }),
        }).then((res) => {
          return res.json();
        });
        console.log(data.products[0]);
        setData(data.products[0]);
        setId(pid);
      }  
      getIdFromParam();
  }, [props]);

  return (
    <>
    <Header />
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
        
      {isMobile ? (
        // Mobile Layout
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            maxWidth: "600px",
            margin: "0 auto",
          }}
        >
          {/* Image Section */}
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              marginBottom: "10px",
            }}
          >
            <img
              src={data.CoverImageUrl}
              alt="Product"
              style={{ width: "100%", borderRadius: "8px" }}
            />
          </div>

          <div style={{marginTop: "60px", color: "white"}}>

          {/* Title Section */}
          <h1
            style={{
              fontSize: "24px",
              margin: "10px 0",
            }}
          >
            {data.Title}
          </h1>

          {/* Price Section */}
          <p
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              // color: "#333",
              // textAlign: "center",
            }}
          >
            $100
          </p>

          {/* Location and Time Section */}
          <div
            style={{
              fontSize: "14px",
              // color: "#666",
              // textAlign: "center",
              marginBottom: "15px",
            }}
          >
            <p>New York,    2 hours ago</p>
          </div>
          </div>

          {/* Send Message Section */}
          <div style={{border: "1px solid #666", padding: "10px", borderRadius: "8px"}}>
          <p style={{color: "white"}}>Send seller a message</p>
          <div style={{  alignItems: "center", display: "flex", justifyContent: "center"}}>
          
          <Input style={{backgroundColor: "white", width: "70%"}} />
          
          <button
            style={{
              width: "20%",
              padding: "12px",
              fontSize: "16px",
              backgroundColor: "#0070f3",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              marginLeft: "10px",
              marginTop: "5px",
              marginBottom: "5px"
            }}
          >
            Send
          </button>
          </div>
          </div>
        </div>
      ) : (
        // Desktop Layout
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            maxWidth: "1200px",
            width: "100%",
            margin: "0 auto",
            marginTop: "150px",
            marginBottom: "100px",
            gap: "20px",
          }}
        >
          {/* First Column - Image Slider */}
          <div
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <img
              src={data.CoverImageUrl}
              alt="Product"
              style={{
                width: "100%",
                maxWidth: "500px",
                borderRadius: "8px",
              }}
            />
          </div>

          {/* Second Column - Content */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              color: "white",
              marginLeft: "100px"
            }}
          >
            {/* Title */}
            <h1
              style={{
                fontSize: "32px",
                marginBottom: "10px",
                textAlign: "left",
              }}
            >
              {data.Title}
            </h1>

            {/* Price */}
            <p
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                marginBottom: "10px",
                textAlign: "left",
              }}
            >
              $100
            </p>

            {/* Location and Time */}
            <div
              style={{
                fontSize: "16px",
                marginBottom: "15px",
                textAlign: "left",
              }}
            >
              <p>Location: New York</p>
              <p>Released Time: 2 hours ago</p>
            </div>
            <div>
              
              <p>Description : {data.Description}</p>
            </div>

            {/* Send Message Button */}
            <div style={{ border: "1px solid #666", marginTop: "20px"}}>
              <div style={{alignItems: "center", display: "flex", justifyContent: "center"}}>
              <Input style={{backgroundColor: "white", width: "60%"}} />
              <button
                style={{
                  width: "15%",
                  padding: "12px",
                  fontSize: "16px",
                  backgroundColor: "#0070f3",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  marginLeft: "10px",
                  marginTop: "5px",
                  marginBottom: "5px"
                }}
              >
                Send
              </button>
              </div>
            </div>
          </div>
        </div>
    )}
    
    </div>
    <Footer />
    </>
  );
}