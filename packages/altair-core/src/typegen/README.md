## typegen directory

This directory contains the files used to generate types. The files must meet the following requirements:

- The file must be a `.ts` file.
- The file must export a `Type` type.
- The file name must be in kebab-case.

The generated types and validators are exported into the `typegen` directory in the build output.
