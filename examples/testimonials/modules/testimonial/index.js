// modules/article/index.js
module.exports = {
  extend: "@apostrophecms/piece-type",
  options: {
    label: "Testimonial",
    pluralLabel: "Testimonials",
  },
  fields: {
    add: {
      names: {
        label: "Names",
        type: "string",
      },
      emailaddress: {
        label: "Email address",
        type: "string",
      },
      phonenumber: {
        label: "Phone Number",
        type: "string",
      },
      testimonial: {
        label: "Testimonial",
        type: "string",
      },
      helpneeded: {
        label: "Help needed",
        type: "string",
      },
      photo: {
        // Photos are not uploaded via the website form to avoid upload issues, but can be added later
        label: "Photo",
        type: "area",
        options: {
          max: 1,
          widgets: {
            "@apostrophecms/image": {},
          },
        },
        required: false,
      },
      active: {
        label: "Active",
        type: "boolean",
        help: "Active testimonials can be viewed on the public website",
      },
    },
    group: {
      basics: {
        label: "Basics",
        fields: [
          "title",
          "names",
          "emailaddress",
          "phonenumber",
          "testimonial",
          "helpneeded",
        ],
      },
      advanced: {
        label: "Photo",
        fields: ["photo"],
      },
      utility: {
        fields: ["active"],
      },
    },
  },
  columns: {
    add: {
      names: {
        label: "Names",
      },
      emailaddress: {
        label: "Email",
      },
      phonenumber: {
        label: "Phone",
      },
      active: {
        label: "Active",
      },
    },
  },
  filters: {
    add: {
      active: {
        label: "Active",
        inputType: "select",
        def: false,
      },
    },
  },
  queries(self, query) {
    builders: {
      return {
        builders: {
          active: {
            // This is our filter to be able to see active or inactive in the manager
            def: null,
            safeFor: "public",
            finalize() {
              const active = query.get("active");
              if (active === null) {
                return;
              }

              if (active) {
                query.and({
                  active: true,
                });
              } else {
                query.and({
                  active: false,
                });
              }
            },
            launder(value) {
              return self.apos.launder.booleanOrNull(value);
            },
            choices() {
              return [
                {
                  value: true,
                  label: "Active",
                },
                {
                  value: false,
                  label: "NOT active",
                },
                {
                  value: null,
                  label: "All items",
                },
              ];
            },
          },
        },
      };
    }
  },
  handlers(self, options) {},
  components(self) {
    return {
      // Returning the five most recently created testimonies.
      async latest(req, data) {
        const articles = await self
          .find(req)
          .active(true)
          .sort({ createdAt: -1 })
          .limit(data.max || 5)
          .toArray();
        return {
          articles,
        };
      },
    };
  },
  methods(self) {
    return {
      async addTestimony(req, initialInfo) {
        // Generate a blank testimony data object.
        let newTestimony = self.newInstance();
        // Add our initial information to the object.
        newTestimony = {
          ...newTestimony,
          ...initialInfo,
        };
        // Assign some arbitrary title to this piece
        newTestimony.title = initialInfo["names"];
        // Set "active" to false - testimonies must be approved before uploading
        newTestimony.active = false;
        Object.assign(newTestimony, { ...initialInfo });
        // Insert the testimonial with the asynchronous `self.insert` method
        const insertResult = await self.insert(req, newTestimony);
        return insertResult;
      },
    };
  },
};
